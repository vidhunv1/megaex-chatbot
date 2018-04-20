declare module "*.json" {
  const value: any;
  export default value;
}

declare module 'jsonwebtoken';

interface KeysInterface {
  telegramUser: {
    key:string,
    expiry:number
  },
  messageCounter: {
    key:string,
    expiry:number,
    shadowKey:string
  },
  tContext: {
    key:string,
    currentContext:string,
    "Wallet.coin":string,
    "CoinSend.isInputAmount":string,
    "CoinSend.amount":string,
    "SendMessage.accountId":string
  },
  paymentExpiryTimer: {
    key:string,
    shadowKey:string,
    expiry:number
  }
}

interface CallbackQuery {
  callbackFunction: 'coinSend' | 'coinAddress' | 'coinWithdraw' | 'paginate' | 'newAddress' | 'qrCode' | 'accountLink' | 'referralLink' | 'addPayment' | 'openOrders' | 'sendMessage' | 'blockAccount',
  messageId: number,
  coinSend?: {
    coin:string,
  },
  coinAddress?: {
    coin:string,
  },
  coinWithdraw?: {
    coin:string,
  },
  qrCode?: {
    coin:string,
    address:string
  }
  back?: {
    coin:string
  }
  paginate?: {
    action: 'next' | 'prev' | 'refresh',
    currentPage:number
  }
  openOrders?: {
    accountId: string
  }
  sendMessage?: {
    accountId: string
  }
  blockAccount?: {
    accountId: string,
    shouldBlock: number 
  }
}