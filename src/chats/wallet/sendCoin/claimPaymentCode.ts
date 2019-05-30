import {
  Transfer,
  User,
  TelegramAccount,
  TransferError,
  TransferErrorType
} from 'models'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'
import * as _ from 'lodash'

export async function claimCode(
  user: User,
  tUser: TelegramAccount,
  secretCode: string
) {
  try {
    const payment = await Transfer.claimPayment(secretCode, user.id)

    const senderUser = await User.findById(payment.userId, {
      include: [{ model: TelegramAccount }]
    })

    await telegramHook.getWebhook.sendMessage(
      tUser.id,
      user.t(`${Namespace.Wallet}:send-coin.payment-success.receiver`, {
        cryptoValueReceived: dataFormatter.formatCryptoCurrency(
          payment.amount,
          payment.currencyCode
        ),
        senderUsername: senderUser ? senderUser.telegramUser.username : '-'
      }),
      {
        parse_mode: 'Markdown'
      }
    )

    if (senderUser) {
      await telegramHook.getWebhook.sendMessage(
        senderUser.telegramUser.id,
        user.t(`${Namespace.Wallet}:send-coin.payment-success.sender`, {
          cryptoValueSent: dataFormatter.formatCryptoCurrency(
            payment.amount,
            payment.currencyCode
          ),
          receiverUsername: tUser.username
        }),
        {
          parse_mode: 'Markdown'
        }
      )
    }
    return true
  } catch (e) {
    if (e instanceof TransferError) {
      let opts = {}
      switch (e.status) {
        case TransferErrorType.INSUFFICIENT_BALANCE: {
          const pInfo = await Transfer.getBySecret(secretCode)
          const createdBy = await User.findById<User>(
            _.get(pInfo, 'userId', -1),
            {
              include: [{ model: TelegramAccount }]
            }
          )
          opts = {
            linkCreatorUsername: createdBy
              ? createdBy.telegramUser.username
              : ''
          }
          break
        }
        case TransferErrorType.SELF_CLAIM: {
          const pInfo = await Transfer.getBySecret(secretCode)
          if (pInfo) {
            opts = {
              cryptoValue: dataFormatter.formatCryptoCurrency(
                pInfo.amount,
                pInfo.currencyCode
              )
            }
          }
        }
      }

      await telegramHook.getWebhook.sendMessage(
        tUser.id,
        user.t(
          `${Namespace.Wallet}:send-coin.transfer-errors.${e.status}`,
          opts
        ),
        {
          parse_mode: 'Markdown'
        }
      )
    }
  }
  return true
}
