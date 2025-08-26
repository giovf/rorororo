from typing import Optional, List
import pandas as pd
import requests
from datetime import datetime
import re
from requests.exceptions import RequestException
from pathlib import Path

def fetch_historical_klines(
    symbol: str,
    interval: str,
    start_time: str,
    end_time: str,
    save_to_csv: bool = False,
    save_path: Optional[Path] = None,
    limit: int = 1000
) -> pd.DataFrame:
    """
    Fetch historical klines (candlestick) data from Binance API.
    
    Args:
        symbol: Trading pair symbol (e.g., 'ETHUSDT')
        interval: Time interval (e.g., '1h', '15m')
        start_time: Start time in format "DD.MM.YYYY-HH:MM:SS.mmm"
        end_time: End time in format "DD.MM.YYYY-HH:MM:SS.mmm"
        save_to_csv: Whether to save the data to CSV
        save_path: Directory path where to save the CSV file
        limit: Maximum number of records per request
    
    Returns:
        pd.DataFrame: DataFrame containing the historical data
        
    Raises:
        ValueError: If invalid parameters are provided
        RequestException: If API request fails
    """
    try:
        if not re.match(r'^\d{2}\.\d{2}\.\d{4}-\d{2}:\d{2}:\d{2}\.\d{3}$', start_time):
            raise ValueError(f"Invalid start_time format: {start_time}. Format should be DD.MM.YYYY-HH:MM:SS.mmm")
        if not re.match(r'^\d{2}\.\d{2}\.\d{4}-\d{2}:\d{2}:\d{2}\.\d{3}$', end_time):
            raise ValueError(f"Invalid end_time format: {end_time}. Format should be DD.MM.YYYY-HH:MM:SS.mmm")
        if not re.match(r'^\d+[mh]$', interval):
            raise ValueError(f"Invalid interval format: {interval}")
            
        d_start = datetime.strptime(start_time, "%d.%m.%Y-%H:%M:%S.%f").strftime('%s.%f')
        start_time_ms = int(float(d_start)*1000)
        d_end = datetime.strptime(end_time, "%d.%m.%Y-%H:%M:%S.%f").strftime('%s.%f')
        end_time_ms = int(float(d_end)*1000)
        
        if end_time_ms <= start_time_ms:
            raise ValueError("end_time must be after start_time")
            
        start_times_ms_arr: List[int] = []

        if re.match(r'^\d+m', interval):
            interval_ms = (int(re.findall(r'\d+', interval)[0])*60000)
        elif re.match(r'^\d+h', interval):
            interval_ms = (int(re.findall(r'\d+', interval)[0])*3600000)
        else:
            raise ValueError(f"Unsupported interval: {interval}")
            
        num_entries = (end_time_ms - start_time_ms)/interval_ms

        if num_entries > limit:
            i = 0
            while i < num_entries:
                start_times_ms_arr.append(start_time_ms + (interval_ms * i))
                i += limit
        else:
            start_times_ms_arr = [start_time_ms]
        
        data = []
        for n_start_time in start_times_ms_arr:
            url = 'https://api.binance.com/api/v3/klines'
            params = {
                'symbol': symbol,
                'interval': interval,
                'startTime': n_start_time,
                'endTime': end_time_ms,
                'limit': limit
            }
            try:
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                data_single = response.json()
                data.extend(data_single)
            except RequestException as e:
                raise RequestException(f"Failed to fetch data from Binance API: {str(e)}")
            
        if not data:
            print(f"No data returned for {symbol} with interval {interval}")
            return pd.DataFrame()

        df = pd.DataFrame(data, columns=[
            'open_time', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_asset_volume', 'number_of_trades',
            'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
        ])
        
        # Convert numeric columns
        numeric_columns = ['open', 'high', 'low', 'close', 'volume', 
                         'quote_asset_volume', 'taker_buy_base_asset_volume', 
                         'taker_buy_quote_asset_volume']
        df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric)
        
        # Convert timestamps
        df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')
        df['close_time'] = pd.to_datetime(df['close_time'], unit='ms')
        df.set_index('open_time', inplace=True)
        
        if save_to_csv:
            filename = f"{symbol}_{interval}_{start_time.split('-')[0]}_{end_time.split('-')[0]}.csv"
            if save_path:
                file_path = save_path / filename
            else:
                file_path = Path(filename)
            df.to_csv(file_path)
            print(f"Data saved to {file_path}")
            
        return df
        
    except Exception as e:
        print(f"Error in fetch_historical_klines: {str(e)}")
        raise