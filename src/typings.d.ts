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
    "CoinSend.amount":string
  }
}

interface CallbackQuery {
  callbackFunction: 'coinSend' | 'coinAddress' | 'coinWithdraw' | 'paginate' | 'newAddress' | 'qrCode',
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
}