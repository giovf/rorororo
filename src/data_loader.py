from typing import Optional
import os
import pandas as pd
from pathlib import Path

class DataLoader:
    def __init__(self, data_directory: str):
        """
        Initializes the DataLoader with the directory where the data is stored.
        
        Args:
            data_directory: Path to the directory containing data files.
            
        Raises:
            ValueError: If the directory doesn't exist
        """
        self.data_directory = Path(data_directory).resolve()
        if not self.data_directory.exists():
            raise ValueError(f"Directory does not exist: {data_directory}")
    
    def load_csv(self, file_name: str) -> pd.DataFrame:
        """
        Loads a CSV file from the data directory.
        
        Args:
            file_name: The name of the CSV file to load.
            
        Returns:
            pd.DataFrame: The loaded data as a DataFrame.
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            pd.errors.EmptyDataError: If the file is empty
        """
        file_path = (self.data_directory / file_name).resolve()
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
            
        try:
            df = pd.read_csv(file_path)
            
            # Convert timestamp columns if they exist
            timestamp_columns = ['open_time', 'close_time']
            for col in timestamp_columns:
                if col in df.columns:
                    df[col] = pd.to_datetime(df[col])
                    
            return df
            
        except pd.errors.EmptyDataError:
            raise pd.errors.EmptyDataError(f"Empty CSV file: {file_path}")
        except Exception as e:
            raise RuntimeError(f"Error loading CSV file {file_path}: {str(e)}")
    
    def load_data(self, file_name: str) -> pd.DataFrame:
        """
        Loads the complete dataset with all required metrics.
        
        Args:
            file_name: The name of the CSV file to load.
            
        Returns:
            pd.DataFrame: The loaded and processed data as a DataFrame.
        """
        data = self.load_csv(file_name)
        
        # Ensure required columns exist
        required_columns = ['open', 'high', 'low', 'close', 'volume']
        missing_columns = [col for col in required_columns if col not in data.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        # Convert numeric columns
        numeric_columns = ['open', 'high', 'low', 'close', 'volume']
        data[numeric_columns] = data[numeric_columns].apply(pd.to_numeric, errors='coerce')
        
        # Remove rows with NaN values
        data = data.dropna(subset=numeric_columns)
        
        # Ensure the data is sorted by open_time if it exists
        if 'open_time' in data.columns:
            data = data.sort_values(by='open_time').reset_index(drop=True)
        
        return data

    def get_available_files(self) -> list[str]:
        """
        Returns a list of available CSV files in the data directory.
        
        Returns:
            list[str]: List of CSV filenames
        """
        return [f.name for f in self.data_directory.glob("*.csv")]

# Example usage:
# loader = DataLoader(data_directory="data/raw/")
# data = loader.load_data("candlestick_data.csv")
