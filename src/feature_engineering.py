from typing import List
import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator
from ta.volatility import BollingerBands
from ta.momentum import RSIIndicator

class FeatureEngineering:
    def __init__(self, timeframes: List[int] = [1, 2, 5, 10]):
        """
        Initializes the FeatureEngineering class with specific timeframes for technical indicators.
        
        Args:
            timeframes: List of integers representing the timeframes (in hours) for calculations
            
        Raises:
            ValueError: If timeframes are invalid
        """
        if not timeframes:
            raise ValueError("timeframes list cannot be empty")
        if not all(isinstance(t, int) and t > 0 for t in timeframes):
            raise ValueError("All timeframes must be positive integers")
            
        self.timeframes = sorted(timeframes)
    
    def add_price_changes(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Adds price change features for the specified timeframes.
        
        Args:
            data: Input dataset with OHLCV data
            
        Returns:
            DataFrame with added price change features
        """
        df = data.copy()
        for timeframe in self.timeframes:
            df[f'price_change_{timeframe}h'] = df['close'].pct_change(periods=timeframe)
            df[f'volume_change_{timeframe}h'] = df['volume'].pct_change(periods=timeframe)
            
        return df
    
    def add_technical_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Adds technical analysis indicators to the dataset.
        
        Args:
            data: Input dataset with OHLCV data
            
        Returns:
            DataFrame with added technical indicators
            
        Raises:
            ValueError: If required columns are missing
        """
        required_columns = ['open', 'high', 'low', 'close', 'volume']
        if not all(col in data.columns for col in required_columns):
            raise ValueError(f"Missing required columns. Need: {required_columns}")
            
        df = data.copy()
        
        # Add Moving Averages
        for timeframe in self.timeframes:
            # Simple Moving Average
            sma = SMAIndicator(close=df['close'], window=timeframe)
            df[f'sma_{timeframe}'] = sma.sma_indicator()
            
            # Exponential Moving Average
            ema = EMAIndicator(close=df['close'], window=timeframe)
            df[f'ema_{timeframe}'] = ema.ema_indicator()
        
        # Add Bollinger Bands
        bb = BollingerBands(close=df['close'], window=20)
        df['bb_upper'] = bb.bollinger_hband()
        df['bb_middle'] = bb.bollinger_mavg()
        df['bb_lower'] = bb.bollinger_lband()
        
        # Add RSI
        rsi = RSIIndicator(close=df['close'], window=14)
        df['rsi'] = rsi.rsi()
        
        # Add Volatility
        df['volatility'] = df['close'].pct_change().rolling(window=20).std()
        
        return df
    
    def add_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Adds all features to the dataset.
        
        Args:
            data: Input dataset with OHLCV data
            
        Returns:
            DataFrame with all features added
        """
        df = self.add_price_changes(data)
        df = self.add_technical_indicators(df)
        
        # Drop rows with NaN values from feature calculations
        df = df.dropna()
        
        return df
    
    def get_feature_names(self) -> List[str]:
        """
        Returns a list of all feature names that will be added.
        
        Returns:
            List of feature names
        """
        base_features = []
        
        # Price and volume changes
        for timeframe in self.timeframes:
            base_features.extend([
                f'price_change_{timeframe}h',
                f'volume_change_{timeframe}h',
                f'sma_{timeframe}',
                f'ema_{timeframe}'
            ])
        
        # Technical indicators
        base_features.extend([
            'bb_upper',
            'bb_middle',
            'bb_lower',
            'rsi',
            'volatility'
        ])
        
        return base_features

# Example usage:
# engineer = FeatureEngineering(timeframes=[1, 2, 5, 10])
# engineered_data = engineer.add_features(data)
