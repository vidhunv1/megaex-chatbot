import { CallbackDefaults } from 'chats/types'
import { PaymentMethods } from 'constants/paymentMethods'

export type PaymentMethodFields = {
  id: number
  paymentMethod: PaymentMethods
  fields: string[]
}

export enum PaymentMethodError {
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  ERROR_CREATING_PAYMENT_METHOD = 'ERROR_CREATING_PAYMENT_METHOD'
}

export enum PaymentMethodStateKey {
  cb_paymentMethods = 'cb_paymentMethods',
  paymentMethods_show = 'paymentMethods_show',

  cb_editPaymentMethods = 'cb_editPaymentMethods',
  editPaymentMethod_show = 'editPaymentMethod_show',
  cb_editPaymentMethodId = 'cb_editPaymentMethodId',

  cb_addPaymentMethod = 'cb_addPaymentMethod',

  paymentMethodInput = 'paymentMethodInput',
  paymentMethodCreated = 'paymentMethodCreated',

  paymentMethodError = 'paymentMethodError'
}

export interface PaymentMethodState {
  [PaymentMethodStateKey.cb_paymentMethods]?: {
    data: {
      addedPaymentMethods: PaymentMethodFields[]
    } | null
  } & CallbackDefaults

  [PaymentMethodStateKey.cb_editPaymentMethods]?: {
    data: {
      addedPaymentMethods: PaymentMethodFields[]
    } | null
  } & CallbackDefaults

  [PaymentMethodStateKey.cb_editPaymentMethodId]?: {
    paymentMethodId: number
    data: {} | null
  } & CallbackDefaults

  [PaymentMethodStateKey.cb_addPaymentMethod]?: {
    data: {
      paymentMethodsList: PaymentMethods[]
    } | null
  } & CallbackDefaults

  [PaymentMethodStateKey.paymentMethodInput]?: {
    data: {
      inputs: {
        paymentMethod: PaymentMethods
        editId: number | null
        fields: string[]
      }
      isSaved: boolean
    } | null
    error:
      | PaymentMethodError.INVALID_PAYMENT_METHOD
      | PaymentMethodError.ERROR_CREATING_PAYMENT_METHOD
      | null
  }
}
