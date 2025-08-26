import pytest
import pandas as pd
from data_loader import DataLoader
from data_splitter import DataSplitter
from feature_engineering import FeatureEngineering

@pytest.fixture
def sample_data():
    """Fixture for creating a sample dataset."""
    data = {
        'open_time': pd.date_range(start='2023-01-01', periods=10, freq='h'),  # Use 'h' instead of 'H'
        'open': [100, 102, 104, 103, 102, 101, 105, 107, 106, 108],
        'high': [102, 104, 105, 104, 103, 106, 107, 109, 110, 111],
        'low': [99, 101, 102, 100, 101, 99, 104, 106, 105, 107],
        'close': [101, 103, 103, 101, 102, 105, 106, 108, 109, 110],
        'volume': [1000, 1500, 1300, 1400, 1100, 1200, 1600, 1700, 1800, 1900],
        'close_time': pd.date_range(start='2023-01-01 01:00', periods=10, freq='h'),  # Use 'h' instead of 'H'
        'quote_asset_volume': [100000, 150000, 130000, 140000, 110000, 120000, 160000, 170000, 180000, 190000],
        'number_of_trades': [100, 200, 150, 180, 160, 170, 190, 210, 220, 230],
        'taker_buy_base_asset_volume': [500, 750, 650, 700, 550, 600, 800, 850, 900, 950],
        'taker_buy_quote_asset_volume': [50000, 75000, 65000, 70000, 55000, 60000, 80000, 85000, 90000, 95000],
    }
    return pd.DataFrame(data)

### **Test for DataLoader**
def test_data_loader_load_csv(sample_data, mocker):
    """Test if DataLoader correctly loads CSV data."""
    mocker.patch('pandas.read_csv', return_value=sample_data)
    loader = DataLoader(data_directory="data/raw/")
    data = loader.load_csv('dummy_file.csv')
    
    assert isinstance(data, pd.DataFrame)
    assert len(data) == 10
    assert 'open_time' in data.columns
    assert 'close' in data.columns

def test_data_loader_load_data(sample_data, mocker):
    """Test if DataLoader correctly loads and processes the entire dataset."""
    mocker.patch('pandas.read_csv', return_value=sample_data)
    loader = DataLoader(data_directory="data/raw/")
    data = loader.load_data('dummy_file.csv')
    
    assert isinstance(data, pd.DataFrame)
    assert len(data) == 10
    assert data['open_time'].is_monotonic_increasing

### **Test for DataSplitter**
def test_data_splitter_split_data(sample_data):
    """Test if DataSplitter correctly splits the data into train, validation, and test sets."""
    splitter = DataSplitter(test_size=0.2, validation_size=0.1)
    split_data = splitter.split_data(sample_data)
    
    assert 'train' in split_data
    assert 'validation' in split_data
    assert 'test' in split_data
    assert len(split_data['train']) == 7  # 70% of 10
    assert len(split_data['validation']) == 1  # 10% of 10
    assert len(split_data['test']) == 2  # 20% of 10

### **Test for FeatureEngineering**
def test_feature_engineering_add_recent_price_changes(sample_data):
    """Test if FeatureEngineering correctly adds recent price change features."""
    engineer = FeatureEngineering(timeframes=[1, 2, 3])
    data = engineer.add_recent_price_changes(sample_data)
    
    for timeframe in [1, 2, 3]:
        column_name = f'price_change_{timeframe}h'
        assert column_name in data.columns
        assert data[column_name].isna().sum() == timeframe  # First `timeframe` rows should be NaN
    
    # Check some actual values
    assert data['price_change_1h'].iloc[1] == pytest.approx((103 - 101) / 101, rel=1e-5)  # Using pytest.approx
    assert data['price_change_2h'].iloc[2] == pytest.approx((103 - 101) / 101, rel=1e-5)

def test_feature_engineering_add_features(sample_data):
    """Test if FeatureEngineering correctly adds all features."""
    engineer = FeatureEngineering(timeframes=[1, 2])
    data = engineer.add_features(sample_data)
    
    assert 'price_change_1h' in data.columns
    assert 'price_change_2h' in data.columns
    # Add more assertions for other features if necessary
