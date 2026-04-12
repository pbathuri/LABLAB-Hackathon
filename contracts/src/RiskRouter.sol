// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RiskRouter
 * @notice Validates trade intents and records execution for an agent hot wallet.
 */
contract RiskRouter is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct RiskParams {
        uint256 maxPositionSizeBps;
        uint256 maxDailyVolumeBps;
        uint256 maxSlippageBps;
        uint256 maxDrawdownBps;
        uint256 cooldownSeconds;
        bool active;
    }

    struct TradeIntent {
        address agent;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 deadline;
        bytes32 strategyHash;
        /// @notice Off-chain portfolio NAV (same decimals as amountIn context, e.g. USDC 6)
        uint256 portfolioNav;
    }

    struct AgentState {
        uint256 dailyVolume;
        uint256 dailyVolumeResetTimestamp;
        uint256 lastTradeTimestamp;
        uint256 totalTrades;
        uint256 peakNav;
        int256 totalPnL;
        bool halted;
    }

    mapping(address => RiskParams) public riskParams;
    mapping(address => AgentState) public agentStates;
    mapping(address => bool) public allowedTokens;

    event TradeValidated(
        address indexed agent,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        bytes32 intentHash
    );
    event TradeExecuted(address indexed agent, bytes32 intentHash, uint256 amountOut);
    event CircuitBreakerTriggered(address indexed agent, string reason, uint256 value);
    event AgentHalted(address indexed agent, string reason);
    event RiskParamsUpdated(address indexed agent, RiskParams params);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setRiskParams(address agent, RiskParams calldata params) external onlyRole(ADMIN_ROLE) {
        riskParams[agent] = params;
        emit RiskParamsUpdated(agent, params);
    }

    function setAllowedToken(address token, bool allowed) external onlyRole(ADMIN_ROLE) {
        allowedTokens[token] = allowed;
    }

    function validateIntent(TradeIntent calldata intent) external view returns (bool valid, string memory reason) {
        RiskParams memory params = riskParams[intent.agent];
        AgentState memory state = agentStates[intent.agent];

        if (!params.active) return (false, "Agent not active");
        if (state.halted) return (false, "Agent halted by circuit breaker");
        if (!allowedTokens[intent.tokenIn] || !allowedTokens[intent.tokenOut]) {
            return (false, "Token not allowed");
        }
        if (intent.deadline < block.timestamp) return (false, "Intent expired");
        if (intent.portfolioNav == 0) return (false, "Invalid NAV");

        if (block.timestamp - state.lastTradeTimestamp < params.cooldownSeconds && state.lastTradeTimestamp != 0) {
            return (false, "Cooldown period active");
        }

        uint256 dailyVol = state.dailyVolume;
        if (block.timestamp - state.dailyVolumeResetTimestamp >= 1 days) {
            dailyVol = 0;
        }

        uint256 maxPos = (intent.portfolioNav * params.maxPositionSizeBps) / 10000;
        if (intent.amountIn > maxPos) {
            return (false, "Exceeds max position bps");
        }

        uint256 maxDaily = (intent.portfolioNav * params.maxDailyVolumeBps) / 10000;
        if (dailyVol + intent.amountIn > maxDaily) {
            return (false, "Exceeds daily volume bps");
        }

        if (state.peakNav > 0 && intent.portfolioNav < state.peakNav) {
            uint256 dd = ((state.peakNav - intent.portfolioNav) * 10000) / state.peakNav;
            if (dd > params.maxDrawdownBps) {
                return (false, "Drawdown circuit");
            }
        }

        if (intent.minAmountOut == 0) {
            return (false, "minAmountOut required");
        }

        return (true, "");
    }

    function recordTradeExecution(
        address agent,
        uint256 amountIn,
        uint256 amountOut,
        bytes32 intentHash,
        uint256 portfolioNavAfter
    ) external onlyRole(AGENT_ROLE) nonReentrant whenNotPaused {
        AgentState storage state = agentStates[agent];

        if (block.timestamp - state.dailyVolumeResetTimestamp >= 1 days) {
            state.dailyVolume = 0;
            state.dailyVolumeResetTimestamp = block.timestamp;
        }

        state.dailyVolume += amountIn;
        state.lastTradeTimestamp = block.timestamp;
        state.totalTrades += 1;

        /// @dev Same-decimal quote only: meaningful when amountIn and amountOut are comparable
        /// (e.g. both USDC 6-decimal notionals). Cross-asset raw amounts must be normalized off-chain.
        int256 tradePnL = int256(amountOut) - int256(amountIn);
        state.totalPnL += tradePnL;

        if (portfolioNavAfter > state.peakNav) {
            state.peakNav = portfolioNavAfter;
        }

        RiskParams memory paramsExec = riskParams[agent];
        if (state.peakNav > 0 && portfolioNavAfter < state.peakNav) {
            uint256 drawdownBps = ((state.peakNav - portfolioNavAfter) * 10000) / state.peakNav;
            if (drawdownBps >= paramsExec.maxDrawdownBps) {
                state.halted = true;
                emit CircuitBreakerTriggered(agent, "Max drawdown exceeded", drawdownBps);
                emit AgentHalted(agent, "Auto-halted: max drawdown");
            }
        }

        emit TradeExecuted(agent, intentHash, amountOut);
    }

    function haltAgent(address agent, string calldata reason) external onlyRole(ADMIN_ROLE) {
        agentStates[agent].halted = true;
        emit AgentHalted(agent, reason);
    }

    function resumeAgent(address agent) external onlyRole(ADMIN_ROLE) {
        agentStates[agent].halted = false;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function getAgentState(address agent) external view returns (AgentState memory) {
        return agentStates[agent];
    }
}
