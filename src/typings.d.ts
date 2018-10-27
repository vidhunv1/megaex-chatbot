declare module "*.json" {
  const value: any;
  export default value;
}

declare module "jsonwebtoken";

interface KeysInterface {
  telegramUser: {
    key: string;
    expiry: number;
  };
  messageCounter: {
    key: string;
    expiry: number;
    shadowKey: string;
  };
  tContext: {
    key: string;
    currentContext: string;
    "Wallet.coin": string;
    "CoinSend.isInputAmount": string;
    "CoinSend.amount": string;
    "SendMessage.accountId": string;
    "EnterPayMethod.methodName": string;
    "EnterPayMethod.fields": string;
    "Trade.minAmount": string;
    "Trade.maxAmount": string;
    "Trade.isInputPrice": string;
    "Trade.isParsePaymethod": string;
    "Trade.price": string;
    "Trade.paymethodId": string;
    "Trade.editOrderId": string;
    expiry: number;
  };
  paymentExpiryTimer: {
    key: string;
    shadowKey: string;
    expiry: number;
  };
}
