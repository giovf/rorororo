#!/usr/bin/env python3

import os
import logging
from datetime import datetime
from pathlib import Path

from data_fetch import fetch_historical_klines
from data_loader import DataLoader
from feature_engineering import FeatureEngineering
from data_splitter import DataSplitter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('crypto_analysis.log')
    ]
)
logger = logging.getLogger(__name__)

def setup_directories():
    """Create necessary directories if they don't exist."""
    data_dir = Path("data")
    raw_dir = data_dir / "raw"
    processed_dir = data_dir / "processed"
    
    for directory in [data_dir, raw_dir, processed_dir]:
        directory.mkdir(exist_ok=True)
        logger.info(f"Ensured directory exists: {directory}")
    
    return raw_dir, processed_dir

def fetch_data(symbol: str, interval: str, start_time: str, end_time: str, raw_dir: Path) -> Path:
    """Fetch cryptocurrency data and return the path to the saved file."""
    logger.info(f"Fetching {symbol} data from {start_time} to {end_time}")
    try:
        df = fetch_historical_klines(
            symbol=symbol,
            interval=interval,
            start_time=start_time,
            end_time=end_time,
            save_to_csv=True
        )
        filename = f"{symbol}_{interval}_{start_time.split('-')[0]}_{end_time.split('-')[0]}.csv"
        logger.info(f"Successfully fetched {len(df)} records")
        return raw_dir / filename
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        raise

def process_data(input_file: Path, processed_dir: Path):
    """Load, process, and split the data."""
    try:
        # Load data
        logger.info("Loading data")
        loader = DataLoader(str(input_file.parent))
        data = loader.load_data(input_file.name)
        logger.info(f"Loaded {len(data)} records")
        
        # Add features
        logger.info("Engineering features")
        engineer = FeatureEngineering(timeframes=[1, 2, 5, 10])
        data_with_features = engineer.add_features(data)
        logger.info(f"Generated {len(engineer.get_feature_names())} features")
        
        # Save processed data
        processed_file = processed_dir / f"processed_{input_file.name}"
        data_with_features.to_csv(processed_file)
        logger.info(f"Saved processed data to {processed_file}")
        
        # Split data
        logger.info("Splitting data into train/validation/test sets")
        splitter = DataSplitter(test_size=0.2, validation_size=0.1)
        splits = splitter.split_data(data_with_features)
        
        # Save splits
        for split_name, split_data in splits.items():
            split_file = processed_dir / f"{split_name}_{input_file.name}"
            split_data.to_csv(split_file)
            logger.info(f"Saved {split_name} set to {split_file}")
            logger.info(f"{split_name} set shape: {split_data.shape}")
            logger.info(f"{split_name} date range: {split_data.index.min()} to {split_data.index.max()}")
        
        return splits
        
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}")
        raise

def main():
    try:
        # Configuration
        symbol = 'ETHUSDT'
        interval = '1h'
        start_time = '01.01.2022-00:00:00.00'
        end_time = '31.12.2024-00:00:00.00'
        
        logger.info("Starting cryptocurrency data analysis pipeline")
        
        # Setup directories
        raw_dir, processed_dir = setup_directories()
        
        # Fetch data
        input_file = fetch_data(symbol, interval, start_time, end_time, raw_dir)
        
        # Process data
        splits = process_data(input_file, processed_dir)
        
        logger.info("Pipeline completed successfully")
        
        # Print summary statistics
        for split_name, split_data in splits.items():
            print(f"\n{split_name.upper()} Set Summary:")
            print(f"Shape: {split_data.shape}")
            print(f"Date Range: {split_data.index.min()} to {split_data.index.max()}")
            print(f"Average Close Price: ${split_data['close'].mean():.2f}")
            print(f"Trading Volume: {split_data['volume'].sum():,.0f}")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()
