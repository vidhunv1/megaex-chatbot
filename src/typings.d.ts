declare module "*.json" {
  const value: any;
  export default value;
}

declare module 'jsonwebtoken';

interface KeysInterface {
  telegramUser: {
    key: string,
    expiry: number
  },
  messageCounter: {
    key: string,
    expiry: number,
    shadowKey: string
  },
  tContext: {
    key: string
  }
}
