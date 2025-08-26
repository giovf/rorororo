#!/usr/bin/env python3

import numpy as np
import pandas as pd
from pathlib import Path
import matplotlib.pyplot as plt

def load_and_verify_data():
    # Set paths
    processed_dir = Path("data/processed")
    base_name = "ETHUSDT_1h_01.01.2023_31.12.2024"
    
    # Load feature names
    with open(processed_dir / f"feature_names_{base_name}.txt", 'r') as f:
        feature_names = f.read().splitlines()
    print(f"\nFeature Names ({len(feature_names)} total):")
    for i, name in enumerate(feature_names):
        print(f"{i:2d}: {name}")
    
    # Load tensors
    train_tensor = np.load(processed_dir / f"train_tensor_{base_name}.npy")
    val_tensor = np.load(processed_dir / f"validation_tensor_{base_name}.npy")
    test_tensor = np.load(processed_dir / f"test_tensor_{base_name}.npy")
    
    print(f"\nData Shapes:")
    print(f"Train tensor:      {train_tensor.shape}")
    print(f"Validation tensor: {val_tensor.shape}")
    print(f"Test tensor:       {test_tensor.shape}")
    
    # Basic statistics for key features
    close_idx = feature_names.index('close')
    volume_idx = feature_names.index('volume')
    rsi_idx = feature_names.index('rsi')
    
    def print_stats(name, tensor, feature_idx):
        # Get the most recent value for each sample
        values = tensor[:, -1, feature_idx]
        print(f"\n{name} Statistics:")
        print(f"Mean:   {values.mean():.2f}")
        print(f"Std:    {values.std():.2f}")
        print(f"Min:    {values.min():.2f}")
        print(f"Max:    {values.max():.2f}")
    
    # Print statistics for close price
    print("\nClose Price Statistics:")
    print_stats("Train Close", train_tensor, close_idx)
    print_stats("Val Close", val_tensor, close_idx)
    print_stats("Test Close", test_tensor, close_idx)
    
    # Print statistics for RSI
    print("\nRSI Statistics:")
    print_stats("Train RSI", train_tensor, rsi_idx)
    print_stats("Val RSI", val_tensor, rsi_idx)
    print_stats("Test RSI", test_tensor, rsi_idx)
    
    # Visualize some features
    plt.figure(figsize=(15, 10))
    
    # Plot close prices
    plt.subplot(2, 1, 1)
    plt.title('Close Price Over Time (Last Timepoint of Each Sample)')
    plt.plot(train_tensor[:, -1, close_idx], label='Train', alpha=0.7)
    plt.plot(range(len(train_tensor), len(train_tensor) + len(val_tensor)), 
             val_tensor[:, -1, close_idx], label='Validation', alpha=0.7)
    plt.plot(range(len(train_tensor) + len(val_tensor), 
                   len(train_tensor) + len(val_tensor) + len(test_tensor)), 
             test_tensor[:, -1, close_idx], label='Test', alpha=0.7)
    plt.legend()
    plt.ylabel('Price')
    
    # Plot RSI
    plt.subplot(2, 1, 2)
    plt.title('RSI Over Time (Last Timepoint of Each Sample)')
    plt.plot(train_tensor[:, -1, rsi_idx], label='Train', alpha=0.7)
    plt.plot(range(len(train_tensor), len(train_tensor) + len(val_tensor)), 
             val_tensor[:, -1, rsi_idx], label='Validation', alpha=0.7)
    plt.plot(range(len(train_tensor) + len(val_tensor), 
                   len(train_tensor) + len(val_tensor) + len(test_tensor)), 
             test_tensor[:, -1, rsi_idx], label='Test', alpha=0.7)
    plt.axhline(y=70, color='r', linestyle='--', alpha=0.3)
    plt.axhline(y=30, color='g', linestyle='--', alpha=0.3)
    plt.legend()
    plt.ylabel('RSI')
    
    plt.tight_layout()
    plt.savefig('data/processed/feature_visualization.png')
    print("\nVisualization saved as 'data/processed/feature_visualization.png'")

if __name__ == "__main__":
    load_and_verify_data()
