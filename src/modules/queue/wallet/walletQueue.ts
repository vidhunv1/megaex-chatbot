import { amqp, telegramHook } from 'modules'
import { WalletQueueName, WalletJob } from './types'
import logger from 'modules/logger'
import { Channel } from 'amqplib'
import btcRPC, { BtcCommands } from 'core/crypto/btcRpc'
import { CryptoCurrency, cryptoCurrencyInfo } from 'constants/currencies'
import * as _ from 'lodash'
import {
  Transaction,
  TransactionSource,
  Withdrawal,
  TelegramAccount,
  User,
  WithdrawalStatus
} from 'models'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'

export class WalletQueue {
  static instance?: WalletQueue = undefined

  constructor() {
    if (WalletQueue.instance) {
      return WalletQueue.instance
    } else {
      WalletQueue.instance = this
    }
  }

  async init(channel: Channel) {
    await channel.assertQueue(WalletQueueName.NEW_DEPOSIT, { durable: true })
    await channel.assertQueue(WalletQueueName.GEN_ADDRESS, { durable: true })
    await channel.assertQueue(WalletQueueName.COMPLETE_WITHDRAWAL, {
      durable: true
    })

    await channel.prefetch(1)
    await this.initializeConsumers(channel)

    logger.info('OK: WalletQueue')
  }

  initializeConsumers(channel: Channel) {
    channel.consume(WalletQueueName.NEW_DEPOSIT, async (msg) => {
      if (msg !== null) {
        try {
          const params: WalletJob[WalletQueueName.NEW_DEPOSIT] = JSON.parse(
            msg.content.toString()
          )
          if (!params || !params.currency || !params.txid) {
            logger.error(
              '[Q] NEW_DEPOSIT: Invalid params: ' + JSON.stringify(params)
            )
            channel.ack(msg)
            return
          }

          if (params.currency !== CryptoCurrency.BTC) {
            logger.error(
              '[Q] NEW_DEPOSIT: Skipping unknown currency' +
                JSON.stringify(params.currency)
            )
            channel.nack(msg)
            return
          }

          let btcResult
          try {
            btcResult = await btcRPC.btcRpcCall<BtcCommands.GET_TRANSACTION>(
              BtcCommands.GET_TRANSACTION,
              [params.txid]
            )
          } catch (e) {
            logger.error('BTC core HTTP error')
            channel.nack(msg)
            throw e
          }

          if (btcResult.error) {
            if (btcResult.error.code === -5) {
              logger.error(
                '[Q] NEW_DEPOSIT: Invalid or non wallet transaction id'
              )
              channel.ack(msg)
            } else {
              logger.error(
                'Unable to handle BTC core error ' +
                  JSON.stringify(btcResult.error)
              )
              channel.nack(msg)
            }
            return
          }
          const receiveInfo = _.find(btcResult.result.details, {
            category: 'receive'
          })
          const confirmations = btcResult.result.confirmations || 0
          if (receiveInfo && receiveInfo.label && receiveInfo.amount) {
            const { label, amount } = receiveInfo
            logger.info(
              `UserId: ${label} received ${amount} BTC with ${confirmations} confirmations, txid: ${
                btcResult.result.txid
              }`
            )
            await Transaction.createOrUpdateDepositTx(
              parseInt(label),
              params.currency,
              params.txid,
              amount,
              confirmations,
              TransactionSource.CORE
            )
            channel.ack(msg)
          } else {
            logger.warn(
              'No receive info in BTC RPC getTransaction for ' +
                btcResult.result.txid +
                ', ' +
                JSON.stringify(btcResult)
            )
            channel.ack(msg)
          }
        } catch (e) {
          logger.error(
            '[Q] Error parsing new deposit parasms: ' +
              JSON.stringify(msg.content.toString())
          )
          channel.nack(msg)
          throw e
        }
      } else {
        logger.error('[Q] New deposit params null' + JSON.stringify(msg))
      }
    })

    channel.consume(WalletQueueName.COMPLETE_WITHDRAWAL, async (msg) => {
      logger.info('[Q] COMPLETE_WITHDRAWAL: ' + JSON.stringify(msg))
      if (msg != null) {
        try {
          const params: WalletJob[WalletQueueName.COMPLETE_WITHDRAWAL] = JSON.parse(
            msg.content.toString()
          )

          if (!params || !params.txid || !params.withdrawalId) {
            logger.error(
              '[Q] COMPLETE_WUTHDRAWAL: Invalid params: ' +
                JSON.stringify(params)
            )
            channel.ack(msg)
            return
          }

          const withdrawal = await Withdrawal.findById(params.withdrawalId)
          if (!withdrawal) {
            logger.error(
              '[Q] No withdrawal with id found: ' + JSON.stringify(params)
            )
            channel.ack(msg)
            return
          }

          if (withdrawal.status === WithdrawalStatus.COMPLETED) {
            logger.info('[Q] Withdrawal already processed')
            channel.ack(msg)
            return
          }

          await Withdrawal.processCompletedWithdrawal(
            params.withdrawalId,
            params.txid
          )

          channel.ack(msg)
          logger.info('[Q] OK COMPLETE_WITHDRAWAL: ' + msg.content.toString())
          const user = await User.findById(withdrawal.userId, {
            include: [{ model: TelegramAccount }]
          })

          if (user) {
            const txUrl = cryptoCurrencyInfo[
              withdrawal.cryptoCurrencyCode
            ].getTxUrl(params.txid)
            const cryptoAmount = dataFormatter.formatCryptoCurrency(
              withdrawal.amount,
              withdrawal.cryptoCurrencyCode
            )

            await telegramHook.getWebhook.sendMessage(
              user.telegramUser.id,
              user.t(`${Namespace.Wallet}:withdraw.withdraw-processed`, {
                cryptoCurrencyAmount: cryptoAmount,
                withdrawalLink: txUrl
              }),
              {
                parse_mode: 'Markdown'
              }
            )
          }
        } catch (e) {
          logger.error(
            '[Q] Error processing withdrawal' +
              msg.content.toString() +
              '\n' +
              e.stack
          )
          channel.nack(msg)
          throw e
        }
      }
    })

    channel.consume(WalletQueueName.GEN_ADDRESS, (msg) => {
      logger.error(
        `TODO: handle ${WalletQueueName.GEN_ADDRESS} Queue ${
          msg ? msg.content.toString() : ''
        }`
      )
    })
  }

  async genAddressToQ(opts: WalletJob[WalletQueueName.GEN_ADDRESS]) {
    const channel = amqp.channel
    await channel.sendToQueue(
      WalletQueueName.GEN_ADDRESS,
      Buffer.from(JSON.stringify(opts), 'utf8'),
      {
        persistent: true
      }
    )
    logger.info('[Q>] Added getAddressToQ ' + JSON.stringify(opts))
  }
}
