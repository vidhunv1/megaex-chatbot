import { RateTypes } from 'models'
import { PaymentMethodType } from 'models'

export enum MyOrdersStateKey {
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

  cb_editPaymentDetails = 'cb_editPaymentDetails',
  editPaymentDetails_show = 'editPaymentDetails_show',

  cb_toggleActive = 'cb_toggleActive',

  cb_showOrder_back = 'cb_showOrder_back',

  showEditSuccess = 'showEditSuccess',

  cb_deleteOrder = 'cb_deleteOrder',
  showDeleteSuccess = 'showDeleteSuccess',

  cb_showActiveOrders = 'cb_showActiveOrders',
  showActiveOrders = 'showActiveOrders',
  cb_showOrderById = 'cb_showOrderById',
  showOrderById = 'showOrderById'
}

export interface MyOrdersState {
  [MyOrdersStateKey.cb_showActiveOrders]?: {}

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
    pm: PaymentMethodType
  }

  [MyOrdersStateKey.cb_toggleActive]?: {
    orderId: number
    isEnabled: boolean
  }

  [MyOrdersStateKey.cb_deleteOrder]?: {
    orderId: number
  }
  [MyOrdersStateKey.cb_showOrder_back]?: {}

  [MyOrdersStateKey.cb_editPaymentDetails]?: {
    pm: PaymentMethodType
  }
  [MyOrdersStateKey.editPaymentDetails_show]?: {
    data: {
      paymentMethod: PaymentMethodType
      fields: string[]
    }
  }

  [MyOrdersStateKey.cb_showOrderById]?: {
    orderId: number
  }
}
