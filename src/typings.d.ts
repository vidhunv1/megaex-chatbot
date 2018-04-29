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
    "SendMessage.accountId":string,
    "EnterPayMethod.methodName":string,
    "EnterPayMethod.fields":string,
    expiry:number
  },
  paymentExpiryTimer: {
    key:string,
    shadowKey:string,
    expiry:number
  }
}

interface CallbackQuery {
  callbackFunction: 
      'coinSend'
    | 'coinAddress'
    | 'coinWithdraw'
    | 'paginate'
    | 'newAddress'
    | 'qrCode'
    | 'accountLink'
    | 'referralLink'
    | 'addPayment'
    | 'deletePayment'
    | 'showPayments'
    | 'editPayment'
    | 'openOrders'
    | 'sendMessage'
    | 'blockAccount'
    | 'buy'
    | 'sell',
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
  addPayment?: {
    paymentId:number
  }
  deletePayment?: {
    paymentId:number
  }
  editPayment?: {
    paymentId:number
  }
  showPayments?: {
    paymentId:number
  }
  blockAccount?: {
    accountId: string,
    shouldBlock: number 
  }
}