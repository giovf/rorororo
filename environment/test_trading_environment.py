
import pytest
import pandas as pd
from trading_environment import TradingEnvironment

@pytest.fixture
def sample_data():
    """Fixture for creating a sample dataset."""
    data = {
        'open_time': pd.date_range(start='2023-01-01', periods=10, freq='h'),
        'open': [100, 102, 104, 103, 102, 101, 105, 107, 106, 108],
        'high': [102, 104, 105, 104, 103, 106, 107, 109, 110, 111],
        'low': [99, 101, 102, 100, 101, 99, 104, 106, 105, 107],
        'close': [101, 103, 103, 101, 102, 105, 106, 108, 109, 110],
        'volume': [1000, 1500, 1300, 1400, 1100, 1200, 1600, 1700, 1800, 1900],
        'close_time': pd.date_range(start='2023-01-01 01:00', periods=10, freq='h'),
        'quote_asset_volume': [100000, 150000, 130000, 140000, 110000, 120000, 160000, 170000, 180000, 190000],
        'number_of_trades': [100, 200, 150, 180, 160, 170, 190, 210, 220, 230],
        'taker_buy_base_asset_volume': [500, 750, 650, 700, 550, 600, 800, 850, 900, 950],
        'taker_buy_quote_asset_volume': [50000, 75000, 65000, 70000, 55000, 60000, 80000, 85000, 90000, 95000],
    }
    return pd.DataFrame(data)

def test_environment_initialization():
    """Test the initialization of the TradingEnvironment."""
    env = TradingEnvironment(initial_balance=10000, max_trade_percent=0.2)
    
    assert env.initial_balance == 10000
    assert env.max_trade_percent == 0.2
    assert env.balance == 10000
    assert env.position == 0

def test_environment_reset(sample_data):
    """Test the environment reset function."""
    env = TradingEnvironment()
    initial_state = env.reset(sample_data)
    
    assert env.balance == env.initial_balance
    assert env.position == 0
    assert env.current_step == 0
    assert 'balance' in initial_state
    assert 'position' in initial_state

def test_environment_step_buy(sample_data):
    """Test the environment step function for a buy action."""
    env = TradingEnvironment(initial_balance=10000, max_trade_percent=0.2)
    env.reset(sample_data)
    
    state, reward, done = env.step(action=1, confidence=0.8)
    
    expected_trade_amount = 10000 * 0.2 * 0.8
    expected_units_bought = expected_trade_amount / sample_data.iloc[0]['close']
    
    assert env.position == expected_units_bought
    assert env.balance == 10000 - expected_trade_amount
    assert reward == 0  # Reward is calculated on selling
    assert not done

def test_environment_step_sell(sample_data):
    """Test the environment step function for a sell action."""
    env = TradingEnvironment(initial_balance=10000, max_trade_percent=0.2)
    env.reset(sample_data)
    
    env.step(action=1, confidence=0.8)  # Buy first
    state, reward, done = env.step(action=2, confidence=0.8)  # Then sell
    
    expected_trade_amount = 10000 * 0.2 * 0.8
    expected_units_sold = expected_trade_amount / sample_data.iloc[1]['close']
    
    assert env.position == 0  # All units should be sold
    assert env.balance > 10000 - expected_trade_amount  # Balance should increase after selling
    assert reward > 0  # Reward should be positive if price increased
    assert not done

def test_environment_step_done_flag(sample_data):
    """Test the environment to ensure it correctly identifies when it's done."""
    env = TradingEnvironment()
    env.reset(sample_data)
    
    for _ in range(len(sample_data)):
        state, reward, done = env.step(action=0, confidence=0.5)
    
    assert done  # Should be done after the last step
    assert env.current_step == len(sample_data)  # Current step should be at the end of the data
