export enum MyOrdersStateKey {
  cb_myOrders = 'cb_myOrders',
  myOrders_show = 'myOrders_show',

  cb_editOrder = 'cb_editOrder',
  cb_editRate = 'cb_editRate',
  cb_editAmount = 'cb_editAmount',
  cb_editTerms = 'cb_editTerms',
  cb_editPaymentMethod = 'cb_editPaymentMethod',
  cb_toggleActive = 'cb_toggleActive',
  cb_deleteOrder = 'cb_deleteOrder',
  cb_showOrder_back = 'cb_showOrder_back'
}

export interface MyOrdersState {
  [MyOrdersStateKey.cb_myOrders]?: {
    data: {} | null
  }
  [MyOrdersStateKey.myOrders_show]?: {
    data: {} | null
  }
  [MyOrdersStateKey.cb_editOrder]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_editRate]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_editAmount]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_editTerms]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_editPaymentMethod]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_toggleActive]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_toggleActive]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_deleteOrder]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_showOrder_back]?: {}
}
