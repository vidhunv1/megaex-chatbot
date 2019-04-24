export enum BuyStateKey {
  cb_buy = 'cb_buy',
  buy_show = 'buy_show'
}

export interface BuyState {
  [BuyStateKey.cb_buy]?: {
    data: {} | null
  }
  [BuyStateKey.buy_show]?: {
    data: {} | null
  }
}
