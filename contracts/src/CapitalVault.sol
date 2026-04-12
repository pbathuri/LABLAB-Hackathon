// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CapitalVault
 * @notice ERC-4626 vault for agent capital sandbox + performance snapshots.
 */
contract CapitalVault is ERC4626, AccessControl {
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

    struct PerformanceSnapshot {
        uint256 timestamp;
        uint256 totalAssets;
        int256 realizedPnL;
        int256 unrealizedPnL;
        uint256 tradeCount;
        uint256 peakNAV;
        uint256 maxDrawdownBps;
    }

    mapping(address => PerformanceSnapshot) public snapshots;
    mapping(address => uint256) public agentStartTimestamp;
    mapping(address => uint256) public agentEndTimestamp;

    event SnapshotUpdated(address indexed agent, int256 pnl, uint256 nav, uint256 drawdownBps);

    constructor(IERC20 asset_) ERC4626(asset_) ERC20("CW Vault Share", "cwVAULT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function registerAgent(address agent, uint256 startTs, uint256 endTs) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(AGENT_ROLE, agent);
        agentStartTimestamp[agent] = startTs;
        agentEndTimestamp[agent] = endTs;
        snapshots[agent] = PerformanceSnapshot({
            timestamp: block.timestamp,
            totalAssets: 0,
            realizedPnL: 0,
            unrealizedPnL: 0,
            tradeCount: 0,
            peakNAV: 0,
            maxDrawdownBps: 0
        });
    }

    function updateSnapshot(
        address agent,
        int256 realizedPnL,
        int256 unrealizedPnL,
        uint256 tradeCount
    ) external onlyRole(AGENT_ROLE) {
        require(agent == msg.sender, "CapitalVault: agent must be msg.sender");
        PerformanceSnapshot storage snap = snapshots[agent];
        snap.timestamp = block.timestamp;
        snap.totalAssets = totalAssets();
        snap.realizedPnL = realizedPnL;
        snap.unrealizedPnL = unrealizedPnL;
        snap.tradeCount = tradeCount;

        uint256 assetVal = totalAssets();
        int256 navInt = int256(assetVal) + realizedPnL + unrealizedPnL;
        uint256 currentNAV = navInt > 0 ? uint256(navInt) : 0;

        if (currentNAV > snap.peakNAV) {
            snap.peakNAV = currentNAV;
        }

        if (snap.peakNAV > 0 && currentNAV < snap.peakNAV) {
            uint256 drawdown = ((snap.peakNAV - currentNAV) * 10000) / snap.peakNAV;
            if (drawdown > snap.maxDrawdownBps) {
                snap.maxDrawdownBps = drawdown;
            }
        }

        emit SnapshotUpdated(agent, realizedPnL, currentNAV, snap.maxDrawdownBps);
    }

    function getSnapshot(address agent) external view returns (PerformanceSnapshot memory) {
        return snapshots[agent];
    }
}
