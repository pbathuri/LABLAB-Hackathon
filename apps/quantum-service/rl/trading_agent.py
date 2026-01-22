"""
Reinforcement Learning Trading Agent

Implements a Markov Decision Process (MDP) for adaptive portfolio management:
- State: Portfolio composition, market indicators, policy constraints
- Actions: Adjust allocations, trade, hold
- Rewards: Risk-adjusted returns (Sharpe ratio based)

Uses PPO (Proximal Policy Optimization) for stable training.

References:
- Schulman et al. (2017), "Proximal Policy Optimization Algorithms"
- Jiang et al. (2017), "Deep Reinforcement Learning for Portfolio Management"
"""

import numpy as np
from typing import Dict, List, Tuple, Any, Optional
import logging
import json
from pathlib import Path

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.distributions import Categorical, Normal
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

logger = logging.getLogger(__name__)


class TradingEnvironment:
    """
    Trading environment following OpenAI Gym interface.
    
    State space:
    - Portfolio weights (n_assets,)
    - Current returns (n_assets,)
    - Volatility indicators (n_assets,)
    - Available budget
    - Days since last trade
    - Policy constraints active
    
    Action space:
    - Target portfolio weights (continuous, [0, 1] per asset)
    """
    
    def __init__(
        self,
        n_assets: int = 4,
        initial_capital: float = 10000,
        transaction_cost: float = 0.001,
        max_daily_trades: int = 5,
    ):
        self.n_assets = n_assets
        self.initial_capital = initial_capital
        self.transaction_cost = transaction_cost
        self.max_daily_trades = max_daily_trades
        
        self.state_dim = n_assets * 3 + 3  # weights, returns, vol + budget, days, policy
        self.action_dim = n_assets
        
        self.reset()
    
    def reset(self) -> np.ndarray:
        """Reset environment to initial state."""
        self.portfolio_value = self.initial_capital
        self.weights = np.ones(self.n_assets) / self.n_assets
        self.trades_today = 0
        self.day = 0
        self.days_since_trade = 0
        
        return self._get_state()
    
    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, Dict]:
        """Execute action and return new state, reward, done, info."""
        # Normalize action to valid weights
        target_weights = self._normalize_weights(action)
        
        # Calculate transaction costs
        weight_change = np.abs(target_weights - self.weights)
        costs = np.sum(weight_change) * self.transaction_cost * self.portfolio_value
        
        # Simulate market returns (in production, use real data)
        returns = self._simulate_returns()
        
        # Update portfolio
        old_value = self.portfolio_value
        self.portfolio_value *= (1 + np.dot(self.weights, returns))
        self.portfolio_value -= costs
        
        # Update state
        self.weights = target_weights
        self.trades_today += 1
        self.day += 1
        self.days_since_trade = 0 if np.any(weight_change > 0.01) else self.days_since_trade + 1
        
        # Calculate reward (risk-adjusted return)
        portfolio_return = (self.portfolio_value - old_value) / old_value
        reward = self._calculate_reward(portfolio_return, returns)
        
        # Check terminal conditions
        done = self.day >= 252 or self.portfolio_value < self.initial_capital * 0.5
        
        info = {
            'portfolio_value': self.portfolio_value,
            'return': portfolio_return,
            'weights': self.weights.tolist(),
            'costs': costs,
        }
        
        return self._get_state(), reward, done, info
    
    def _get_state(self) -> np.ndarray:
        """Construct state vector."""
        # Simulate current market conditions
        returns = self._simulate_returns()
        volatility = np.abs(returns) * 2
        
        state = np.concatenate([
            self.weights,
            returns,
            volatility,
            [self.portfolio_value / self.initial_capital],
            [self.days_since_trade / 30],
            [1.0 if self.trades_today < self.max_daily_trades else 0.0],
        ])
        
        return state.astype(np.float32)
    
    def _normalize_weights(self, action: np.ndarray) -> np.ndarray:
        """Normalize action to valid portfolio weights."""
        # Clip to [0, 1]
        weights = np.clip(action, 0, 1)
        # Normalize to sum to 1
        if np.sum(weights) > 0:
            weights = weights / np.sum(weights)
        else:
            weights = np.ones(self.n_assets) / self.n_assets
        return weights
    
    def _simulate_returns(self) -> np.ndarray:
        """Simulate asset returns (replace with real data in production)."""
        # Geometric Brownian Motion simulation
        mu = np.array([0.0001, 0.0002, 0.00015, 0.00025])[:self.n_assets]
        sigma = np.array([0.02, 0.03, 0.025, 0.015])[:self.n_assets]
        
        returns = mu + sigma * np.random.randn(self.n_assets)
        return returns
    
    def _calculate_reward(
        self,
        portfolio_return: float,
        asset_returns: np.ndarray,
    ) -> float:
        """
        Calculate reward using Sharpe-like metric.
        
        Reward = return - risk_penalty + diversity_bonus
        """
        # Base return reward
        reward = portfolio_return * 100  # Scale up
        
        # Risk penalty (volatility of holdings)
        portfolio_vol = np.std(asset_returns * self.weights)
        risk_penalty = portfolio_vol * 10
        
        # Diversity bonus (entropy of weights)
        entropy = -np.sum(self.weights * np.log(self.weights + 1e-8))
        diversity_bonus = entropy * 0.1
        
        return reward - risk_penalty + diversity_bonus


if TORCH_AVAILABLE:
    class PolicyNetwork(nn.Module):
        """
        Actor-Critic network for PPO.
        """
        
        def __init__(self, state_dim: int, action_dim: int, hidden_dim: int = 128):
            super().__init__()
            
            # Shared feature extractor
            self.shared = nn.Sequential(
                nn.Linear(state_dim, hidden_dim),
                nn.ReLU(),
                nn.Linear(hidden_dim, hidden_dim),
                nn.ReLU(),
            )
            
            # Actor (policy) head
            self.actor_mean = nn.Linear(hidden_dim, action_dim)
            self.actor_std = nn.Parameter(torch.ones(action_dim) * 0.5)
            
            # Critic (value) head
            self.critic = nn.Linear(hidden_dim, 1)
        
        def forward(self, state: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
            features = self.shared(state)
            
            # Actor output
            mean = torch.sigmoid(self.actor_mean(features))  # [0, 1] for weights
            std = torch.clamp(self.actor_std, 0.01, 1.0)
            
            # Critic output
            value = self.critic(features)
            
            return mean, std, value
        
        def get_action(self, state: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
            mean, std, value = self(state)
            
            dist = Normal(mean, std)
            action = dist.sample()
            log_prob = dist.log_prob(action).sum(-1)
            
            return action, log_prob, value
        
        def evaluate(self, state: torch.Tensor, action: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
            mean, std, value = self(state)
            
            dist = Normal(mean, std)
            log_prob = dist.log_prob(action).sum(-1)
            entropy = dist.entropy().sum(-1)
            
            return log_prob, value, entropy


class TradingAgent:
    """
    PPO-based trading agent for adaptive portfolio management.
    """
    
    def __init__(
        self,
        n_assets: int = 4,
        learning_rate: float = 3e-4,
        gamma: float = 0.99,
        gae_lambda: float = 0.95,
        clip_ratio: float = 0.2,
        value_coef: float = 0.5,
        entropy_coef: float = 0.01,
        model_path: Optional[str] = None,
    ):
        self.n_assets = n_assets
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_ratio = clip_ratio
        self.value_coef = value_coef
        self.entropy_coef = entropy_coef
        
        self.env = TradingEnvironment(n_assets=n_assets)
        
        if TORCH_AVAILABLE:
            self.policy = PolicyNetwork(
                state_dim=self.env.state_dim,
                action_dim=self.env.action_dim,
            )
            self.optimizer = optim.Adam(self.policy.parameters(), lr=learning_rate)
            
            if model_path and Path(model_path).exists():
                self.load_model(model_path)
        else:
            self.policy = None
            logger.warning("PyTorch not available - using rule-based fallback")
    
    def get_action(self, state: np.ndarray) -> np.ndarray:
        """Get action from current policy."""
        if not TORCH_AVAILABLE or self.policy is None:
            return self._fallback_action(state)
        
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            mean, _, _ = self.policy(state_tensor)
            return mean.squeeze().numpy()
    
    def optimize_allocation(
        self,
        current_weights: List[float],
        expected_returns: List[float],
        volatilities: List[float],
        risk_tolerance: float,
    ) -> Dict[str, Any]:
        """
        Get optimal allocation suggestion from RL agent.
        
        Args:
            current_weights: Current portfolio weights
            expected_returns: Expected returns per asset
            volatilities: Volatility per asset
            risk_tolerance: User risk tolerance (0-1)
            
        Returns:
            Suggested allocation and reasoning
        """
        # Construct state
        state = np.concatenate([
            np.array(current_weights),
            np.array(expected_returns),
            np.array(volatilities),
            [1.0],  # Normalized budget
            [0.0],  # Days since trade
            [1.0],  # Policy allows trading
        ]).astype(np.float32)
        
        # Get action
        target_weights = self.get_action(state)
        target_weights = self._normalize_weights(target_weights)
        
        # Adjust based on risk tolerance
        # Lower risk = more conservative (closer to equal weights)
        equal_weights = np.ones(len(current_weights)) / len(current_weights)
        adjusted_weights = (
            risk_tolerance * target_weights + 
            (1 - risk_tolerance) * equal_weights
        )
        adjusted_weights = self._normalize_weights(adjusted_weights)
        
        return {
            'suggested_weights': adjusted_weights.tolist(),
            'weight_changes': (adjusted_weights - np.array(current_weights)).tolist(),
            'confidence': float(risk_tolerance * 0.7 + 0.3),
            'reasoning': self._generate_reasoning(current_weights, adjusted_weights, expected_returns),
        }
    
    def train(self, n_episodes: int = 1000, save_path: Optional[str] = None) -> Dict[str, List]:
        """Train the agent using PPO."""
        if not TORCH_AVAILABLE:
            return {'rewards': [], 'values': []}
        
        history = {'rewards': [], 'values': []}
        
        for episode in range(n_episodes):
            states, actions, rewards, log_probs, values, dones = self._collect_trajectory()
            
            # Calculate advantages using GAE
            advantages = self._compute_gae(rewards, values, dones)
            returns = advantages + values[:-1]
            
            # PPO update
            self._ppo_update(states, actions, log_probs, returns, advantages)
            
            episode_reward = sum(rewards)
            history['rewards'].append(episode_reward)
            history['values'].append(values[-1].item())
            
            if episode % 100 == 0:
                avg_reward = np.mean(history['rewards'][-100:])
                logger.info(f"Episode {episode}, Avg Reward: {avg_reward:.4f}")
        
        if save_path:
            self.save_model(save_path)
        
        return history
    
    def _collect_trajectory(self, max_steps: int = 252):
        """Collect a trajectory using current policy."""
        states, actions, rewards, log_probs, values, dones = [], [], [], [], [], []
        
        state = self.env.reset()
        
        for _ in range(max_steps):
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            action, log_prob, value = self.policy.get_action(state_tensor)
            
            next_state, reward, done, _ = self.env.step(action.squeeze().numpy())
            
            states.append(state)
            actions.append(action.squeeze().numpy())
            rewards.append(reward)
            log_probs.append(log_prob)
            values.append(value)
            dones.append(done)
            
            state = next_state
            
            if done:
                break
        
        # Final value for GAE
        with torch.no_grad():
            _, _, final_value = self.policy(torch.FloatTensor(state).unsqueeze(0))
        values.append(final_value)
        
        return states, actions, rewards, log_probs, values, dones
    
    def _compute_gae(self, rewards, values, dones):
        """Compute Generalized Advantage Estimation."""
        advantages = []
        gae = 0
        
        for t in reversed(range(len(rewards))):
            if t == len(rewards) - 1:
                next_value = values[t + 1]
            else:
                next_value = values[t + 1]
            
            delta = rewards[t] + self.gamma * next_value * (1 - dones[t]) - values[t]
            gae = delta + self.gamma * self.gae_lambda * (1 - dones[t]) * gae
            advantages.insert(0, gae)
        
        return torch.FloatTensor(advantages)
    
    def _ppo_update(self, states, actions, old_log_probs, returns, advantages, epochs: int = 4):
        """Perform PPO policy update."""
        states = torch.FloatTensor(np.array(states))
        actions = torch.FloatTensor(np.array(actions))
        old_log_probs = torch.cat(old_log_probs)
        
        # Normalize advantages
        advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)
        
        for _ in range(epochs):
            log_probs, values, entropy = self.policy.evaluate(states, actions)
            
            # Policy loss (clipped)
            ratio = torch.exp(log_probs - old_log_probs)
            surr1 = ratio * advantages
            surr2 = torch.clamp(ratio, 1 - self.clip_ratio, 1 + self.clip_ratio) * advantages
            policy_loss = -torch.min(surr1, surr2).mean()
            
            # Value loss
            value_loss = nn.MSELoss()(values.squeeze(), returns)
            
            # Total loss
            loss = policy_loss + self.value_coef * value_loss - self.entropy_coef * entropy.mean()
            
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.policy.parameters(), 0.5)
            self.optimizer.step()
    
    def _fallback_action(self, state: np.ndarray) -> np.ndarray:
        """Rule-based fallback when PyTorch is not available."""
        n = self.n_assets
        
        # Extract weights from state
        current_weights = state[:n]
        returns = state[n:2*n]
        
        # Simple momentum strategy
        momentum = returns / (np.abs(returns).sum() + 1e-8)
        target_weights = current_weights + 0.1 * momentum
        
        return self._normalize_weights(target_weights)
    
    def _normalize_weights(self, weights: np.ndarray) -> np.ndarray:
        """Normalize to valid portfolio weights."""
        weights = np.clip(weights, 0, 1)
        if np.sum(weights) > 0:
            return weights / np.sum(weights)
        return np.ones(len(weights)) / len(weights)
    
    def _generate_reasoning(
        self,
        current: List[float],
        suggested: np.ndarray,
        returns: List[float],
    ) -> str:
        """Generate human-readable reasoning for the suggestion."""
        changes = suggested - np.array(current)
        
        increases = [(i, c) for i, c in enumerate(changes) if c > 0.05]
        decreases = [(i, c) for i, c in enumerate(changes) if c < -0.05]
        
        reasoning = []
        
        if increases:
            idx, change = max(increases, key=lambda x: x[1])
            reasoning.append(f"Increasing allocation to asset {idx} by {change*100:.1f}% based on positive momentum")
        
        if decreases:
            idx, change = min(decreases, key=lambda x: x[1])
            reasoning.append(f"Reducing allocation to asset {idx} by {abs(change)*100:.1f}% to manage risk")
        
        if not reasoning:
            reasoning.append("Maintaining current allocation - no significant rebalancing needed")
        
        return ". ".join(reasoning) + "."
    
    def save_model(self, path: str):
        """Save model weights."""
        if TORCH_AVAILABLE and self.policy:
            torch.save(self.policy.state_dict(), path)
            logger.info(f"Model saved to {path}")
    
    def load_model(self, path: str):
        """Load model weights."""
        if TORCH_AVAILABLE and self.policy:
            self.policy.load_state_dict(torch.load(path))
            logger.info(f"Model loaded from {path}")
