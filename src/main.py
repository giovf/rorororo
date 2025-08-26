#!/usr/bin/env python3

import os
import logging
from datetime import datetime
from pathlib import Path
import pandas as pd
import numpy as np

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
    # Construct the expected filename
    filename = f"{symbol}_{interval}_{start_time.split('-')[0]}_{end_time.split('-')[0]}.csv"
    file_path = raw_dir / filename
    
    # Check if file already exists
    if file_path.exists():
        logger.info(f"Found existing data file: {file_path}")
        try:
            # Verify the file is valid by attempting to read it
            df = pd.read_csv(file_path)
            if len(df) > 0:
                logger.info(f"Using existing data with {len(df)} records")
                return file_path
            else:
                logger.warning("Existing file is empty, will fetch new data")
        except Exception as e:
            logger.warning(f"Existing file is corrupted ({str(e)}), will fetch new data")
    else:
        logger.info(f"No existing data file found for {symbol} from {start_time} to {end_time}")
    
    # Fetch new data if needed
    logger.info(f"Fetching {symbol} data from {start_time} to {end_time}")
    try:
        df = fetch_historical_klines(
            symbol=symbol,
            interval=interval,
            start_time=start_time,
            end_time=end_time,
            save_to_csv=True,
            save_path=raw_dir
        )
        logger.info(f"Successfully fetched {len(df)} records")
        return file_path
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
        
        # Add features with enhanced engineering
        logger.info("Engineering features")
        engineer = FeatureEngineering(timeframes=[1, 2, 5, 10], lookback_periods=10)
        state_dict = engineer.add_features(data, simulate_ob=True)
        logger.info(f"Generated state tensor with shape {state_dict['state_tensor'].shape}")
        logger.info(f"Number of features: {len(state_dict['feature_names'])}")
        
        # Save state tensor and feature names
        state_file = processed_dir / f"state_tensor_{input_file.name.replace('.csv', '.npy')}"
        np.save(state_file, state_dict['state_tensor'])
        
        feature_file = processed_dir / f"feature_names_{input_file.name.replace('.csv', '.txt')}"
        with open(feature_file, 'w') as f:
            f.write('\n'.join(state_dict['feature_names']))
            
        logger.info(f"Saved state tensor to {state_file}")
        logger.info(f"Saved feature names to {feature_file}")
        
        # Split data for training
        logger.info("Splitting data into train/validation/test sets")
        splitter = DataSplitter(test_size=0.2, validation_size=0.1)
        n_samples = state_dict['state_tensor'].shape[0]
        
        # Create index array and split it
        indices = np.arange(n_samples)
        split_indices = splitter.split_indices(indices)
        
        # Save split tensors
        for split_name, split_idx in split_indices.items():
            split_tensor = state_dict['state_tensor'][split_idx]
            split_file = processed_dir / f"{split_name}_tensor_{input_file.name.replace('.csv', '.npy')}"
            np.save(split_file, split_tensor)
            logger.info(f"Saved {split_name} tensor to {split_file}")
            logger.info(f"{split_name} tensor shape: {split_tensor.shape}")
        
        return split_indices
        
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}")
        raise

def main():
    try:
        # Configuration
        symbol = 'ETHUSDT'
        interval = '1h'
        start_time = '01.01.2023-00:00:00.000'  # Format: DD.MM.YYYY-HH:MM:SS.mmm
        end_time = '31.12.2024-00:00:00.000'    # Format: DD.MM.YYYY-HH:MM:SS.mmm
        
        logger.info("Starting cryptocurrency data analysis pipeline")
        
        # Setup directories
        raw_dir, processed_dir = setup_directories()
        
        # Fetch data
        input_file = fetch_data(symbol, interval, start_time, end_time, raw_dir)
        
        # Process data
        splits = process_data(input_file, processed_dir)
        
        logger.info("Pipeline completed successfully")
        
        # Print summary statistics
        for split_name, split_idx in splits.items():
            logger.info(f"\n{split_name.upper()} Set Summary:")
            logger.info(f"Shape: {len(split_idx)}")
            logger.info(f"Date Range: Not available")
            logger.info(f"Average Close Price: Not available")
            logger.info(f"Trading Volume: Not available")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()
