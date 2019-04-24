export enum CreateOrderStateKey {
  cb_createOrder = 'cb_createOrder',
  createOrder_show = 'createOrder_show'
}

export interface CreateOrderState {
  [CreateOrderStateKey.cb_createOrder]?: {
    data: {} | null
  }
  [CreateOrderStateKey.createOrder_show]?: {
    data: {} | null
  }
}
