import { CONFIG } from '../../config'
import { RpcClient, RpcResult } from 'modules/rpcClient'
import { cryptoCurrencyInfo, CryptoCurrency } from 'constants/currencies'
import { Transaction, TransactionType, TransactionSource } from 'models'
import * as _ from 'lodash'
import logger from 'modules/logger'

export enum BtcCommands {
  GET_NEW_ADDRESS = 'getnewaddress',
  GET_TRANSACTION = 'gettransaction',
  LIST_RECEIVED_BY_ADDRESS = 'listreceivedbyaddress'
}

interface BtcParams {
  [BtcCommands.GET_NEW_ADDRESS]: [string] // account address
  [BtcCommands.GET_TRANSACTION]: [string] // in-wallet transaction id
  [BtcCommands.LIST_RECEIVED_BY_ADDRESS]: [number] // min-confirmations
}

interface BtcResult {
  [BtcCommands.GET_NEW_ADDRESS]: string // address
  [BtcCommands.GET_TRANSACTION]: {
    amount: number
    fee?: number
    confirmations?: number
    blockhash?: string
    blockindex?: number
    blocktime?: number
    txid: string
    walletconflicts: any[]
    time: number
    timereceived: number
    'bip125-replaceable': 'yes' | 'no' | 'unknown'
    hex: string
    details: {
      address?: string
      category: 'send' | 'receive' | 'generate' | 'immature' | 'orphan'
      amount: number
      vout: number
      fee: 0.0
      label: string
    }[]
  }
  [BtcCommands.LIST_RECEIVED_BY_ADDRESS]: {
    address: string
    amount: number
    confirmations: number
    label: string
    txids: [string]
  }[]
}

logger.error('TODO: Write cron to sync BTC transacions')
export class BtcRpc {
  rpcClient!: RpcClient
  static instance: BtcRpc
  constructor() {
    if (BtcRpc.instance) return BtcRpc.instance

    this.rpcClient = new RpcClient({
      host: CONFIG.BTC_NODE_HOST,
      port: +CONFIG.BTC_NODE_PORT,
      protocol: 'http',
      user: CONFIG.BTC_NODE_USERNAME,
      pass: CONFIG.BTC_NODE_PASSWORD
    })

    BtcRpc.instance = this
  }

  async btcRpcCall<RemoteCommand extends BtcCommands>(
    command: RemoteCommand,
    params: BtcParams[RemoteCommand]
  ): Promise<{
    result: BtcResult[RemoteCommand]
    error: RpcResult['error']
  }> {
    const res = await this.rpcClient.rpc(command, params)
    return {
      result: (res.data as unknown) as BtcResult[RemoteCommand],
      error: res.error
    }
  }

  async syncTransactions() {
    logger.info('Syncing BTC transactions')
    const requiredConfirmations =
      cryptoCurrencyInfo[CryptoCurrency.BTC].confirmations
    const result = await this.btcRpcCall<BtcCommands.LIST_RECEIVED_BY_ADDRESS>(
      BtcCommands.LIST_RECEIVED_BY_ADDRESS,
      [requiredConfirmations]
    )

    const coreTx: {
      [userId: number]: {
        txids: string[]
        amount: number
        confirmations: number
      }
    } = {}
    result.result.forEach((txInfo) => {
      const userId = parseInt(txInfo.label)
      if (!userId) {
        logger.error('Invalid user id: ' + txInfo.label)
        return
      }

      const prevAmount = _.get(coreTx[userId], 'amount', 0)
      const prevConfirmations = _.get(coreTx[userId], 'confirmations', 0)
      const prevTxids = _.get(coreTx[userId], 'txids', [])

      coreTx[userId] = {
        amount: prevAmount + txInfo.amount,
        confirmations:
          prevConfirmations < txInfo.confirmations
            ? prevConfirmations
            : txInfo.confirmations, // the one with the least confirmations should be the latest
        txids: [...txInfo.txids, ...prevTxids]
      }
    })

    for (const [userId, userTx] of Object.entries(coreTx)) {
      const coreBalance: number = JSON.parse(
        JSON.stringify(
          await Transaction.find({
            attributes: [[Transaction.sequelize.literal('SUM(amount)'), 'sum']],
            where: {
              currencyCode: CryptoCurrency.BTC,
              userId,
              transactionType: TransactionType.RECEIVE,
              transactionSource: TransactionSource.CORE
            }
          })
        )
      ).sum

      if (coreBalance != userTx.amount) {
        // TODO: Sync and update transacions
        logger.error(
          `ALERT! Unsynced balance available for user: ${userId}, actual: ${
            userTx.amount
          } available: ${coreBalance}`
        )
      } else {
        logger.info(`SYNC ok for ${userId}: ${userTx.amount} = ${coreBalance}`)
      }
    }
  }
}

export default new BtcRpc()
