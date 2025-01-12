class TransactionCosts:
    def __init__(self, fee_percent=0.001):
        """
        Initializes the transaction cost model.
        
        :param fee_percent: float - The percentage of each transaction to be taken as a fee.
        """
        self.fee_percent = fee_percent

    def calculate_cost(self, trade_amount):
        """
        Calculates the transaction cost based on the trade amount.
        
        :param trade_amount: float - The amount of funds being traded.
        :return: float - The transaction cost.
        """
        return trade_amount * self.fee_percent

# Example usage:
# cost_model = TransactionCosts(fee_percent=0.001)
# cost = cost_model.calculate_cost(trade_amount=10000)
