export enum SellStateKey {
  cb_sell = 'cb_sell',
  sell_show = 'sell_show'
}

export interface SellState {
  [SellStateKey.cb_sell]?: {
    data: {} | null
  }
  [SellStateKey.sell_show]?: {
    data: {} | null
  }
}
