from typing import Dict
import pandas as pd
from sklearn.model_selection import train_test_split
import numpy as np

class DataSplitter:
    def __init__(self, test_size: float = 0.2, validation_size: float = 0.1):
        """
        Initializes the DataSplitter with the desired sizes for test and validation sets.
        
        Args:
            test_size: Proportion of the data to be used as the test set (0 to 1)
            validation_size: Proportion of the remaining data to be used as the validation set (0 to 1)
            
        Raises:
            ValueError: If sizes are invalid
        """
        if not 0 < test_size < 1:
            raise ValueError("test_size must be between 0 and 1")
        if not 0 < validation_size < 1:
            raise ValueError("validation_size must be between 0 and 1")
        if test_size + validation_size >= 1:
            raise ValueError("Sum of test_size and validation_size must be less than 1")
            
        self.test_size = test_size
        self.validation_size = validation_size

    def split_data(self, data: pd.DataFrame) -> Dict[str, pd.DataFrame]:
        """
        Splits the data into training, validation, and test sets while preserving temporal order.
        
        Args:
            data: The full dataset to split
            
        Returns:
            Dict containing 'train', 'validation', and 'test' DataFrames
            
        Raises:
            ValueError: If data is empty or invalid
        """
        if not isinstance(data, pd.DataFrame):
            raise ValueError("Input must be a pandas DataFrame")
        if len(data) < 3:
            raise ValueError("Dataset too small to split")
            
        # Calculate split indices
        total_size = len(data)
        test_size = int(total_size * self.test_size)
        val_size = int((total_size - test_size) * self.validation_size)
        
        # Split the data maintaining temporal order
        test_data = data.iloc[-test_size:]
        remaining_data = data.iloc[:-test_size]
        validation_data = remaining_data.iloc[-val_size:]
        train_data = remaining_data.iloc[:-val_size]
        
        # Verify splits
        if len(train_data) == 0 or len(validation_data) == 0 or len(test_data) == 0:
            raise ValueError("One or more splits are empty. Adjust split sizes.")
            
        return {
            'train': train_data,
            'validation': validation_data,
            'test': test_data
        }
        
    def get_split_sizes(self, data_length: int) -> Dict[str, int]:
        """
        Calculate the sizes of each split for a given dataset length.
        
        Args:
            data_length: Length of the dataset
            
        Returns:
            Dict containing the size of each split
        """
        test_size = int(data_length * self.test_size)
        remaining = data_length - test_size
        val_size = int(remaining * self.validation_size)
        train_size = remaining - val_size
        
        return {
            'train': train_size,
            'validation': val_size,
            'test': test_size
        }

# Example usage:
# splitter = DataSplitter(test_size=0.2, validation_size=0.1)
# split_data = splitter.split_data(data)
