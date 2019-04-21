import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler, BotCommand } from 'chats/types'
import {
  SignupState,
  initialState,
  SIGNUP_STATE_LABEL,
  nextSignupState
} from './SignupState'
import { CacheHelper } from 'lib/CacheHelper'
import { signupParser } from './signupParser'
import { signupResponder } from './signupResponder'

export const SignupChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    _command: BotCommand,
    user: User,
    tUser: TelegramAccount,
    state: SignupState | null
  ) {
    if (
      !user.isTermsAccepted ||
      !user.currencyCode ||
      !user.locale ||
      (state && state.key === SIGNUP_STATE_LABEL)
    ) {
      const currentState =
        (await CacheHelper.getState<SignupState>(tUser.id)) || initialState

      const nextState: SignupState | null = await signupParser(
        msg,
        tUser.id,
        user,
        currentState
      )

      if (nextState === null) {
        return false
      }

      return signupResponder(msg, user, nextState)
    } else {
      return false
    }
  },

  async handleCallback(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount,
    _callback: TelegramBot.CallbackQuery
  ) {
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: SignupState | null
  ) {
    if (
      (state && state.key === SIGNUP_STATE_LABEL) ||
      !user.isTermsAccepted ||
      !user.currencyCode ||
      !user.locale
    ) {
      const currentState = state as SignupState

      const updatedState: SignupState | null = await signupParser(
        msg,
        tUser.id,
        user,
        currentState || initialState
      )

      const nextState: SignupState | null = await nextSignupState(
        updatedState,
        tUser.id
      )

      if (nextState === null) {
        return false
      }

      return signupResponder(msg, user, nextState)
    } else {
      return false
    }
  }
}
