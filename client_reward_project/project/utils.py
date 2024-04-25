class Util:
    @staticmethod
    def get_conversion(cost, currency):
        print(cost, currency)
        if currency == "USD" or currency == "usd":
            cost *= 83.34
        elif currency == "EURO" or currency == 'euro':
            cost *= 89.06

        return cost 