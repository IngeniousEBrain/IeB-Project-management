class Util:
    @staticmethod
    def get_conversion(cost, currency):
        print(cost, currency)
        if currency == "usd":
            cost *= 83.34
        elif currency == 'euro':
            cost *= 89.06

        return cost 