import { PaymentMethodStateKey, PaymentMethodError } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import * as _ from 'lodash'
import { PaymentMethodsFieldsLocale } from 'constants/paymentMethods'
import { logger } from 'modules'
import { PaymentMethodMessage } from './messages'

export const PaymentMethodResponder: Responder<AccountState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<PaymentMethodStateKey, () => Promise<boolean>> = {
    [PaymentMethodStateKey.paymentMethodError]: async () => {
      const errorType: PaymentMethodError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )

      if (!errorType) {
        return false
      }

      switch (errorType) {
        case PaymentMethodError.INVALID_PAYMENT_METHOD:
          await PaymentMethodMessage(msg, user).pmDoesNotExist()
          return true

        case PaymentMethodError.ERROR_CREATING_PAYMENT_METHOD:
          await PaymentMethodMessage(msg, user).pmCreateError()
          return true
      }

      logger.error('Unhandled error type in AccountResponder ' + errorType)
      return false
    },

    [PaymentMethodStateKey.paymentMethods_show]: async () => {
      const data = _.get(
        currentState[PaymentMethodStateKey.cb_paymentMethods],
        'data',
        null
      )
      if (!data) {
        return false
      }

      await PaymentMethodMessage(msg, user).showPaymentMethods(
        data.addedPaymentMethods
      )
      return true
    },

    [PaymentMethodStateKey.editPaymentMethod_show]: async () => {
      const data = _.get(
        currentState[PaymentMethodStateKey.cb_editPaymentMethods],
        'data',
        null
      )
      if (!data) {
        return false
      }

      await PaymentMethodMessage(msg, user).showEditPaymentMethod(
        data.addedPaymentMethods
      )
      return true
    },

    [PaymentMethodStateKey.paymentMethodInput]: async () => {
      const data = _.get(
        currentState[PaymentMethodStateKey.paymentMethodInput],
        'data',
        null
      )
      if (!data || (data && !data.inputs.paymentMethod)) {
        await PaymentMethodMessage(msg, user).selectPaymentMethodInput()
        return true
      }

      const { inputs } = data
      if (
        inputs.fields.length <
        PaymentMethodsFieldsLocale[inputs.paymentMethod].length
      ) {
        await PaymentMethodMessage(msg, user).inputPaymentMethodField(
          inputs.paymentMethod,
          inputs.fields
        )
        return true
      } else {
        logger.error(
          `Invalid state: all fields exists accountResponder#${
            currentState.currentStateKey
          }`
        )
        return false
      }
    },

    [PaymentMethodStateKey.paymentMethodCreated]: async () => {
      const data = _.get(
        currentState[PaymentMethodStateKey.paymentMethodInput],
        'data',
        null
      )
      if (!data || !data.inputs) {
        return false
      }

      if (data.inputs.editId) {
        await PaymentMethodMessage(msg, user).showPMEditSuccess(
          data.inputs.paymentMethod,
          data.inputs.fields
        )
      } else {
        await PaymentMethodMessage(msg, user).showPMCreateSuccess(
          data.inputs.paymentMethod,
          data.inputs.fields
        )
      }
      return true
    },

    [PaymentMethodStateKey.cb_paymentMethods]: async () => {
      return false
    },
    [PaymentMethodStateKey.cb_editPaymentMethods]: async () => {
      return false
    },
    [PaymentMethodStateKey.cb_editPaymentMethodId]: async () => {
      return false
    },
    [PaymentMethodStateKey.cb_addPaymentMethod]: async () => {
      return false
    }
  }

  return resp[currentState.currentStateKey as PaymentMethodStateKey]()
}
