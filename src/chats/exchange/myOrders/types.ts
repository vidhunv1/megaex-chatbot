export enum MyOrdersStateKey {
  cb_myOrders = 'cb_myOrders',
  myOrders_show = 'myOrders_show'
}

export interface MyOrdersState {
  [MyOrdersStateKey.cb_myOrders]?: {
    data: {} | null
  }
  [MyOrdersStateKey.myOrders_show]?: {
    data: {} | null
  }
}
