import { OrderType } from 'models'

export enum CreateOrderStateKey {
  cb_showCreateOrder = 'cb_showCreateOrder',
  createOrder_show = 'createOrder_show',

  cb_createNewOrder = 'cb_createNewOrder',

  cb_useMarginPrice = 'cb_useMarginPrice',
  cb_useFixedPrice = 'cb_useFixedPrice',

  createOrderError = 'createOrderError',

  inputRate = 'inputRate',
  inputAmountLimit = 'inputAmountLimit',
  createdOrder = 'createdOrder'
}

export enum CreateOrderError {
  ERROR_CREATE_SELL_ORDER = 'ERROR_CREATE_SELL_ORDER',
  ERROR_CREATE_BUY_ORDER = 'ERROR_CREATE_BUY_ORDER'
}

export interface CreateOrderState {
  [CreateOrderStateKey.cb_showCreateOrder]?: {
    data: {} | null
  }

  [CreateOrderStateKey.createOrder_show]?: {
    data: {} | null
  }

  [CreateOrderStateKey.cb_createNewOrder]?: {
    orderType: OrderType
    data: {} | null
  }

  [CreateOrderStateKey.cb_useMarginPrice]?: {
    orderType: OrderType
    data: {} | null
  }

  [CreateOrderStateKey.cb_useFixedPrice]?: {
    orderType: OrderType
    data: {} | null
  }

  [CreateOrderStateKey.inputAmountLimit]?: {
    data: {
      minAmount: number
      maxAmount: number
      createdOrderId: number
    } | null
    error: CreateOrderError.ERROR_CREATE_BUY_ORDER | null
  }

  [CreateOrderStateKey.inputRate]?: {
    data: {
      valueType: 'fixed' | 'margin'
      value: number
    } | null
  }
}
