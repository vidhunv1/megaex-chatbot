import { PaymentMethodStateKey, PaymentMethodError } from './types'
import { Parser } from 'chats/types'
import {
  updateNextAccountState,
  AccountStateKey,
  AccountState
} from '../AccountState'
import * as _ from 'lodash'
import {
  PaymentMethodsFieldsLocale,
  PaymentMethodAvailability
} from 'constants/paymentMethods'
import { logger } from 'modules'
import { FiatCurrency } from 'constants/currencies'
import {
  PaymentMethodType,
  PaymentMethod,
  PaymentMethodFields
} from 'models/PaymentMethod'

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
            addedPaymentMethods: await getSavedPaymentMethods(user.id)
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
            addedPaymentMethods: await getSavedPaymentMethods(user.id)
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
      let pmSelected = _.get(
        currentState[PaymentMethodStateKey.cb_addPaymentMethod],
        'pmSelected',
        null
      )

      // @ts-ignore
      pmSelected = pmSelected === 'null' ? null : pmSelected

      return {
        ...currentState,
        [PaymentMethodStateKey.cb_addPaymentMethod]: {
          ...cbState,
          data: {
            paymentMethodsList: getAllPaymentMethods(user.currencyCode)
          }
        },
        [PaymentMethodStateKey.paymentMethodInput]: pmSelected
          ? {
              data: {
                inputs: {
                  paymentMethod: pmSelected,
                  editId: null,
                  fields: []
                },
                isSaved: false
              },
              error: null
            }
          : undefined
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
          const fields: string[] = inputs.fields.concat(msg.text)
          const pmId = _.get(
            currentState[PaymentMethodStateKey.cb_editPaymentMethodId],
            'paymentMethodId'
          )

          let isSaved = false
          if (pmId) {
            isSaved = await editPaymentMethod(
              parseInt(pmId + ''),
              user.id,
              inputs.paymentMethod,
              fields
            )
          } else {
            isSaved = await savePaymentMethod(
              user.id,
              inputs.paymentMethod,
              fields
            )
          }
          if (isSaved) {
            return {
              ...currentState,
              [PaymentMethodStateKey.paymentMethodInput]: {
                data: {
                  inputs: {
                    ...inputs,
                    fields
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
                paymentMethod: findPM as PaymentMethodType,
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

      const allPms = await getSavedPaymentMethods(user.id)
      const pm = _.find(allPms, ['id', cbState.paymentMethodId])
      if (pm == null) {
        logger.error('PM shouldnt be undefined')
        return null
      }

      return {
        ...currentState,
        [PaymentMethodStateKey.paymentMethodInput]: {
          data: {
            inputs: {
              paymentMethod: pm.paymentMethod,
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

async function savePaymentMethod(
  userId: number,
  pm: PaymentMethodType,
  fields: string[]
) {
  try {
    await PaymentMethod.savePaymentMethod(userId, pm, fields)
  } catch (e) {
    logger.error('Error saving payment method: ' + JSON.stringify(e))
    return false
  }
  return true
}

async function editPaymentMethod(
  id: number,
  userId: number,
  pm: PaymentMethodType,
  fields: string[]
) {
  try {
    await PaymentMethod.editPaymentMethod(id, userId, pm, fields)
  } catch (e) {
    logger.error('Error editing payment method: ' + JSON.stringify(e))
    return false
  }
  return true
}

const getAllPaymentMethods = (
  currencyCode: FiatCurrency
): PaymentMethodType[] =>
  // @ts-ignore
  Object.keys(PaymentMethodAvailability).filter(
    // @ts-ignore
    (key) => PaymentMethodAvailability[key] === currencyCode || 'ALL'
  )

async function getSavedPaymentMethods(
  userId: number
): Promise<PaymentMethodFields[]> {
  return await PaymentMethod.getSavedPaymentMethods(userId)
}
