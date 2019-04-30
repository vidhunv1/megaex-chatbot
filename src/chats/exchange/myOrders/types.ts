import { RateTypes } from 'models'
import { PaymentMethods } from 'constants/paymentMethods'

export enum MyOrdersStateKey {
  cb_myOrders = 'cb_myOrders',
  myOrders_show = 'myOrders_show',

  cb_editOrder = 'cb_editOrder',

  cb_editRate = 'cb_editRate',
  editRate_show = 'editRate_show',

  cb_editAmount = 'cb_editAmount',
  editAmount_show = 'editAmount_show',

  cb_editTerms = 'cb_editTerms',
  editTerms_show = 'editTerms_show',

  cb_editPaymentMethod = 'cb_editPaymentMethod',
  editPaymentMethod_show = 'editPaymentMethod_show',
  cb_editPaymentMethodSelected = 'cb_editPaymentMethodSelected',

  cb_toggleActive = 'cb_toggleActive',

  cb_showOrder_back = 'cb_showOrder_back',

  showEditSuccess = 'showEditSuccess',

  cb_deleteOrder = 'cb_deleteOrder',
  showDeleteSuccess = 'showDeleteSuccess'
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
  [MyOrdersStateKey.editRate_show]?: {
    data: {
      value: number
      valueType: RateTypes
    } | null
  }

  [MyOrdersStateKey.cb_editAmount]?: {
    orderId: number
  }
  [MyOrdersStateKey.editAmount_show]?: {
    data: {
      minAmount: number
      maxAmount: number
    } | null
  }

  [MyOrdersStateKey.cb_editTerms]?: {
    orderId: number
  }
  [MyOrdersStateKey.editTerms_show]?: {
    data: {
      terms: string
    } | null
  }

  [MyOrdersStateKey.cb_editPaymentMethod]?: {
    orderId: number
  }
  [MyOrdersStateKey.editPaymentMethod_show]?: {}
  [MyOrdersStateKey.cb_editPaymentMethodSelected]?: {
    pm: PaymentMethods
  }

  [MyOrdersStateKey.cb_toggleActive]?: {
    orderId: number
    isEnabled: boolean
  }

  [MyOrdersStateKey.cb_deleteOrder]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_showOrder_back]?: {}
}
