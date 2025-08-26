import numpy as np

class TradingEnvironment:
    def __init__(self, initial_balance=10000, max_trade_percent=0.2):
        """
        Initializes the trading environment.
        
        :param initial_balance: float - The starting balance for the trading environment.
        :param max_trade_percent: float - The maximum percentage of the current balance that can be used in a single trade.
        """
        self.initial_balance = initial_balance
        self.balance = initial_balance
        self.max_trade_percent = max_trade_percent
        self.position = 0  # Represents the amount of the asset currently held
        self.current_step = 0
        self.data = None  # This will hold the market data (OHLC, etc.)

    def reset(self, data):
        """
        Resets the environment to its initial state.
        
        :param data: pd.DataFrame - The historical market data to use in the environment.
        :return: dict - The initial state.
        """
        self.balance = self.initial_balance
        self.position = 0
        self.current_step = 0
        self.data = data
        return self._get_state()

    def _get_state(self):
        """
        Retrieves the current state from the market data.
        
        :return: dict - The current market state.
        """
        state = self.data.iloc[self.current_step].to_dict()
        state['balance'] = self.balance
        state['position'] = self.position
        return state

    def step(self, action, confidence):
        """
        Executes a step in the environment based on the agent's action.
        
        :param action: int - The action to take (0 = hold, 1 = buy, 2 = sell).
        :param confidence: float - The confidence level of the action (between 0 and 1).
        :return: tuple - A tuple containing the new state, the reward, and a done flag.
        """
        current_price = self.data.iloc[self.current_step]['close']
        reward = 0
        done = False
        
        trade_amount = self._calculate_trade_amount(confidence)

        if action == 1:  # Buy
            self._buy(trade_amount, current_price)
        elif action == 2:  # Sell
            reward = self._sell(trade_amount, current_price)

        self.current_step += 1
        
        if self.current_step >= len(self.data):
            done = True

        next_state = self._get_state()
        return next_state, reward, done

    def _calculate_trade_amount(self, confidence):
        """
        Calculates the amount to trade based on confidence and balance.
        
        :param confidence: float - The confidence level of the action.
        :return: float - The amount to trade.
        """
        trade_percent = min(self.max_trade_percent * confidence, self.max_trade_percent)
        trade_amount = self.balance * trade_percent
        return trade_amount

    def _buy(self, trade_amount, price):
        """
        Executes a buy action.
        
        :param trade_amount: float - The amount of funds to use for buying.
        :param price: float - The current price of the asset.
        """
        units_bought = trade_amount / price
        self.position += units_bought
        self.balance -= trade_amount

    def _sell(self, trade_amount, price):
        """
        Executes a sell action.
        
        :param trade_amount: float - The amount of the asset to sell (converted to funds).
        :param price: float - The current price of the asset.
        :return: float - The reward from selling.
        """
        units_sold = trade_amount / price
        units_sold = min(units_sold, self.position)  # Can't sell more than we have
        funds_received = units_sold * price
        self.position -= units_sold
        self.balance += funds_received
        reward = funds_received - trade_amount  # Reward is profit (ignore costs for simplicity)
        return reward

# Example usage:
# env = TradingEnvironment()
# state = env.reset(data)
# next_state, reward, done = env.step(action=1, confidence=0.9)
