from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator
from ta.volatility import BollingerBands, AverageTrueRange
from ta.momentum import RSIIndicator
from ta.volume import AccDistIndexIndicator

class FeatureEngineering:
    def __init__(self, timeframes: List[int] = [1, 2, 5, 10], lookback_periods: int = 10):
        """
        Initializes the FeatureEngineering class with specific timeframes for technical indicators.
        
        Args:
            timeframes: List of integers representing the timeframes (in hours) for calculations
            lookback_periods: Number of past candles to include in state space
            
        Raises:
            ValueError: If timeframes are invalid
        """
        if not timeframes:
            raise ValueError("timeframes list cannot be empty")
        if not all(isinstance(t, int) and t > 0 for t in timeframes):
            raise ValueError("All timeframes must be positive integers")
        if lookback_periods < 1:
            raise ValueError("lookback_periods must be positive")
            
        self.timeframes = sorted(timeframes)
        self.lookback_periods = lookback_periods
    
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
    
    def calculate_vwap(self, data: pd.DataFrame) -> pd.Series:
        """Calculate VWAP manually."""
        typical_price = (data['high'] + data['low'] + data['close']) / 3
        vwap = (typical_price * data['volume']).cumsum() / data['volume'].cumsum()
        return vwap

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
        df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['bb_middle']
        
        # Add RSI
        rsi = RSIIndicator(close=df['close'], window=14)
        df['rsi'] = rsi.rsi()
        
        # Add ATR
        atr = AverageTrueRange(high=df['high'], low=df['low'], close=df['close'], window=14)
        df['atr'] = atr.average_true_range()
        
        # Add VWAP
        df['vwap'] = self.calculate_vwap(df)
        
        # Add Accumulation/Distribution Index
        adi = AccDistIndexIndicator(high=df['high'], low=df['low'], close=df['close'], volume=df['volume'])
        df['adi'] = adi.acc_dist_index()
        
        # Add custom momentum features
        df['price_momentum'] = (df['close'] - df['open']) / df['open']
        
        # Add volatility features for different timeframes
        for timeframe in self.timeframes:
            df[f'volatility_{timeframe}'] = df['close'].pct_change().rolling(window=timeframe).std()
            df[f'high_low_range_{timeframe}'] = ((df['high'] - df['low']) / df['close']).rolling(window=timeframe).mean()
        
        return df
    
    def simulate_order_book(self, data: pd.DataFrame, spread_percent: float = 0.001) -> pd.DataFrame:
        """
        Simulates basic order book data based on OHLCV data.
        
        Args:
            data: Input DataFrame with OHLCV data
            spread_percent: Estimated bid-ask spread as percentage of price
            
        Returns:
            DataFrame with simulated order book features
        """
        df = data.copy()
        
        # Simulate bid/ask prices
        df['bid'] = df['close'] * (1 - spread_percent/2)
        df['ask'] = df['close'] * (1 + spread_percent/2)
        
        # Simulate bid/ask volumes based on actual volume
        df['bid_volume'] = df['volume'] * np.random.uniform(0.4, 0.6, len(df))
        df['ask_volume'] = df['volume'] - df['bid_volume']
        
        # Calculate spread and mid price
        df['spread'] = df['ask'] - df['bid']
        df['mid_price'] = (df['ask'] + df['bid']) / 2
        
        return df
    
    def create_state_tensor(self, data: pd.DataFrame) -> Dict[str, np.ndarray]:
        """
        Creates a state tensor with lookback periods for RL training.
        
        Args:
            data: DataFrame with all features
            
        Returns:
            Dictionary containing state tensors with shape (n_samples, lookback_periods, n_features)
        """
        # Select numerical columns only
        feature_cols = data.select_dtypes(include=[np.number]).columns
        
        # Ensure we have enough data points
        if len(data) < self.lookback_periods:
            raise ValueError(f"Not enough data points. Need at least {self.lookback_periods} points")
        
        # Calculate number of samples
        n_samples = len(data) - self.lookback_periods + 1
        if n_samples <= 0:
            raise ValueError(f"Invalid number of samples: {n_samples}")
        
        # Create state tensors
        state_tensor = np.zeros((n_samples, self.lookback_periods, len(feature_cols)))
        
        # Fill the tensor
        for i in range(n_samples):
            state_tensor[i] = data[feature_cols].iloc[i:i+self.lookback_periods].values
            
        return {
            'state_tensor': state_tensor,
            'feature_names': list(feature_cols)
        }
    
    def add_features(self, data: pd.DataFrame, simulate_ob: bool = True) -> Dict[str, np.ndarray]:
        """
        Adds all features to the dataset and creates state tensor.
        
        Args:
            data: Input dataset with OHLCV data
            simulate_ob: Whether to simulate order book data
            
        Returns:
            Dictionary containing state tensors and feature information
        """
        df = self.add_price_changes(data)
        df = self.add_technical_indicators(df)
        
        if simulate_ob:
            df = self.simulate_order_book(df)
        
        # Replace inf values with NaN
        df = df.replace([np.inf, -np.inf], np.nan)
        
        # Forward fill NaN values
        df = df.ffill()
        # Backward fill any remaining NaNs at the start
        df = df.bfill()
        
        # Check for any remaining NaN values
        nan_columns = df.columns[df.isna().any()].tolist()
        if nan_columns:
            print("Columns with NaN values:", nan_columns)
            print("\nSample of NaN locations:")
            for col in nan_columns:
                nan_indices = df[df[col].isna()].index
                print(f"{col}: {len(nan_indices)} NaN values at indices {list(nan_indices[:5])}...")
            
            # For now, fill any remaining NaNs with 0
            df = df.fillna(0)
            print("\nFilled remaining NaN values with 0")
        
        # Create state tensor for RL
        return self.create_state_tensor(df)
    
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
                f'ema_{timeframe}',
                f'volatility_{timeframe}',
                f'high_low_range_{timeframe}'
            ])
        
        # Technical indicators
        base_features.extend([
            'bb_upper',
            'bb_middle',
            'bb_lower',
            'bb_width',
            'rsi',
            'atr',
            'vwap',
            'adi',
            'price_momentum'
        ])
        
        # Order book features
        base_features.extend([
            'bid',
            'ask',
            'bid_volume',
            'ask_volume',
            'spread',
            'mid_price'
        ])
        
        return base_features

# Example usage:
# engineer = FeatureEngineering(timeframes=[1, 2, 5, 10])
# engineered_data = engineer.add_features(data)
