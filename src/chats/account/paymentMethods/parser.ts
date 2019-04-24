import {
  PaymentMethodStateKey,
  PaymentMethodError,
  PaymentMethodFields
} from './types'
import { Parser } from 'chats/types'
import {
  updateNextAccountState,
  AccountStateKey,
  AccountState
} from '../AccountState'
import * as _ from 'lodash'
import {
  PaymentMethodsFieldsLocale,
  PaymentMethods,
  PaymentMethodAvailability
} from 'constants/paymentMethods'
import logger from 'modules/Logger'
import { FiatCurrency } from 'constants/currencies'

export const PaymentMethodParser: Parser<AccountState> = async (
  msg,
  user,
  tUser,
  currentState
) => {
  const parser: Record<
    PaymentMethodStateKey,
    () => Promise<AccountState | null>
  > = {
    [PaymentMethodStateKey.cb_paymentMethods]: async () => {
      const cbState = _.get(
        currentState,
        PaymentMethodStateKey.cb_paymentMethods,
        null
      )
      if (cbState == null) {
        return null
      }

      return {
        ...currentState,
        [PaymentMethodStateKey.cb_paymentMethods]: {
          ...cbState,
          data: {
            addedPaymentMethods: getAddedPaymentMethods()
          }
        }
      }
    },

    [PaymentMethodStateKey.cb_editPaymentMethods]: async () => {
      const cbState = _.get(
        currentState,
        PaymentMethodStateKey.cb_editPaymentMethods,
        null
      )
      if (cbState == null) {
        return null
      }

      return {
        ...currentState,
        [PaymentMethodStateKey.cb_editPaymentMethods]: {
          ...cbState,
          data: {
            addedPaymentMethods: getAddedPaymentMethods()
          }
        }
      }
    },

    [PaymentMethodStateKey.cb_addPaymentMethod]: async () => {
      const cbState = _.get(
        currentState,
        PaymentMethodStateKey.cb_addPaymentMethod,
        null
      )
      if (cbState == null) {
        return null
      }

      return {
        ...currentState,
        [PaymentMethodStateKey.cb_addPaymentMethod]: {
          ...cbState,
          data: {
            paymentMethodsList: getAllPaymentMethods(user.currencyCode)
          }
        }
      }
    },

    [PaymentMethodStateKey.paymentMethodInput]: async () => {
      if (!msg.text) {
        return null
      }

      const pmInputState = _.get(
        currentState,
        PaymentMethodStateKey.paymentMethodInput,
        null
      )

      // Parse input fields
      if (
        pmInputState &&
        pmInputState.data &&
        pmInputState.data.inputs.paymentMethod != null
      ) {
        const { inputs } = pmInputState.data
        if (
          inputs.fields.length <
          PaymentMethodsFieldsLocale[inputs.paymentMethod].length - 1
        ) {
          return {
            ...currentState,
            [PaymentMethodStateKey.paymentMethodInput]: {
              data: {
                inputs: {
                  ...inputs,
                  fields: inputs.fields.concat(msg.text)
                },
                isSaved: false
              },
              error: null
            }
          }
        } else if (
          inputs.fields.length ===
          PaymentMethodsFieldsLocale[inputs.paymentMethod].length - 1
        ) {
          const isSaved = savePaymentMethod(inputs)
          if (isSaved) {
            return {
              ...currentState,
              [PaymentMethodStateKey.paymentMethodInput]: {
                data: {
                  inputs: {
                    ...inputs,
                    fields: inputs.fields.concat(msg.text)
                  },
                  isSaved: true
                },
                error: null
              }
            }
          } else {
            return {
              ...currentState,
              [PaymentMethodStateKey.paymentMethodInput]: {
                data: null,
                error: PaymentMethodError.ERROR_CREATING_PAYMENT_METHOD
              }
            }
          }
        } else {
          logger.error('INVALID STATE: accountParse#parseMethodInput')
          return null
        }
      }

      // Parse Payment method
      const findPM = getAllPaymentMethods(user.currencyCode).find(
        (pm) => msg.text === user.t(`payment-methods.names.${pm}`)
      )

      const inputs = _.get(
        currentState,
        `${PaymentMethodStateKey.paymentMethodInput}.data.inputs`,
        null
      )

      if (findPM) {
        return {
          ...currentState,
          [PaymentMethodStateKey.paymentMethodInput]: {
            data: {
              inputs: {
                ...inputs,
                paymentMethod: findPM as PaymentMethods,
                fields: []
              },
              isSaved: false
            },
            error: null
          }
        }
      } else {
        return {
          ...currentState,
          [PaymentMethodStateKey.paymentMethodInput]: {
            data: null,
            error: PaymentMethodError.INVALID_PAYMENT_METHOD
          }
        }
      }
    },

    [PaymentMethodStateKey.cb_editPaymentMethodId]: async () => {
      const cbState = _.get(
        currentState,
        PaymentMethodStateKey.cb_editPaymentMethodId,
        null
      )
      if (!cbState) {
        return null
      }

      return {
        ...currentState,
        [PaymentMethodStateKey.paymentMethodInput]: {
          data: {
            inputs: {
              paymentMethod: getAddedPaymentMethods(+cbState.paymentMethodId)[0]
                .paymentMethod,
              editId: parseInt(cbState.paymentMethodId + ''),
              fields: []
            },
            isSaved: false
          },
          error: null
        }
      }
    },

    [PaymentMethodStateKey.editPaymentMethod_show]: async () => {
      return currentState
    },

    [PaymentMethodStateKey.paymentMethodError]: async () => {
      return currentState
    },

    [PaymentMethodStateKey.paymentMethodCreated]: async () => {
      return currentState
    },

    [PaymentMethodStateKey.paymentMethods_show]: async () => {
      return currentState
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as PaymentMethodStateKey
  ]()
  const nextStateKey = nextPaymentMethodState(updatedState)
  const nextState = updateNextAccountState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextPaymentMethodState(
  state: AccountState | null
): AccountStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case PaymentMethodStateKey.cb_paymentMethods:
      return PaymentMethodStateKey.paymentMethods_show
    case PaymentMethodStateKey.paymentMethods_show:
      return null

    case PaymentMethodStateKey.cb_editPaymentMethods:
      return PaymentMethodStateKey.editPaymentMethod_show
    case PaymentMethodStateKey.editPaymentMethod_show:
      return null

    case PaymentMethodStateKey.cb_editPaymentMethodId:
      return PaymentMethodStateKey.paymentMethodInput

    case PaymentMethodStateKey.cb_addPaymentMethod:
      return PaymentMethodStateKey.paymentMethodInput

    case PaymentMethodStateKey.paymentMethodInput: {
      const pmInputState = _.get(
        state,
        PaymentMethodStateKey.paymentMethodInput,
        null
      )

      if (pmInputState && pmInputState.error) {
        return PaymentMethodStateKey.paymentMethodError
      }

      if (!pmInputState || !pmInputState.data) {
        return PaymentMethodStateKey.paymentMethodInput
      }

      if (pmInputState.data.isSaved) {
        return PaymentMethodStateKey.paymentMethodCreated
      } else {
        return PaymentMethodStateKey.paymentMethodInput
      }
    }

    case PaymentMethodStateKey.paymentMethodCreated: {
      return null
    }
    default:
      return null
  }
}

const savePaymentMethod = (_pm: any) => {
  return true
}

const getAllPaymentMethods = (currencyCode: FiatCurrency): PaymentMethods[] =>
  // @ts-ignore
  Object.keys(PaymentMethodAvailability).filter(
    // @ts-ignore
    (key) => PaymentMethodAvailability[key] === currencyCode || 'ALL'
  )

const getAddedPaymentMethods = (id?: number): PaymentMethodFields[] => {
  const pms = [
    {
      id: 1,
      paymentMethod: PaymentMethods.BANK_TRANSFER_INR,
      fields: ['Axis Bank', '10291029120912', 'IOBA000124']
    },
    {
      id: 2,
      paymentMethod: PaymentMethods.PAYTM,
      fields: ['+91 9999999999']
    }
  ]

  if (id) {
    const pm = _.find(pms, { id })
    if (pm) {
      return [pm]
    }
    return []
  }

  return pms
}
