import { CONFIG } from '../../config'
import { RpcClient, RpcResult } from 'modules/rpcClient'
import { cryptoCurrencyInfo, CryptoCurrency } from 'constants/currencies'
import { Transaction, TransactionSource } from 'models'
import * as _ from 'lodash'
import logger from 'modules/logger'

export enum BtcCommands {
  GET_NEW_ADDRESS = 'getnewaddress',
  GET_TRANSACTION = 'gettransaction',
  ESTIMATE_SMART_FEE = 'estimatesmartfee',
  LIST_RECEIVED_BY_ADDRESS = 'listreceivedbyaddress'
}

interface BtcParams {
  [BtcCommands.GET_NEW_ADDRESS]: [string] // account address
  [BtcCommands.GET_TRANSACTION]: [string] // in-wallet transaction id
  [BtcCommands.LIST_RECEIVED_BY_ADDRESS]: [number] // min-confirmations
  [BtcCommands.ESTIMATE_SMART_FEE]: [number, 'ECONOMICAL' | 'CONSERVATIVE'] // [block, feeType]
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
  [BtcCommands.ESTIMATE_SMART_FEE]: {
    feerate: number
    blocks: number
    errors: any
  }
}

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

    for (const [uid, userTx] of Object.entries(coreTx)) {
      const userId = parseInt(uid)
      if (!userId) {
        logger.error('Invalid user id: ' + uid)
        return
      }

      const allBalances = await Transaction.getCoreDepositAmount(
        userId,
        CryptoCurrency.BTC
      )
      if (!allBalances) {
        logger.error('Error fetching transaction balances')
        return
      }

      const appBtcConfirmedBalance = allBalances.confirmedBalance

      if (appBtcConfirmedBalance < userTx.amount) {
        // TODO: Sync and update transacions
        logger.warn(
          `ALERT! Unsynced balance available for user: ${userId}, actual: ${
            userTx.amount
          } available: ${appBtcConfirmedBalance}`
        )

        logger.info('Syncing balance')

        userTx.txids.forEach(async (txId) => {
          let btcResult
          try {
            btcResult = await this.btcRpcCall<BtcCommands.GET_TRANSACTION>(
              BtcCommands.GET_TRANSACTION,
              [txId]
            )

            logger.info('update txid' + JSON.stringify(btcResult.result))

            if (btcResult.error) {
              if (btcResult.error.code === -5) {
                logger.error(
                  '[Q] NEW_DEPOSIT: Invalid or non wallet transaction id'
                )
              } else {
                logger.error(
                  'Unable to handle BTC core error ' +
                    JSON.stringify(btcResult.error)
                )
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
                `Update new TX for UserId: ${label} received ${amount} BTC with ${confirmations} confirmations, txid: ${
                  btcResult.result.txid
                }`
              )
              await Transaction.createOrUpdateDepositTx(
                parseInt(label),
                CryptoCurrency.BTC,
                txId,
                amount,
                confirmations,
                TransactionSource.CORE
              )
            } else {
              logger.warn(
                'No receive info in BTC RPC getTransaction for ' +
                  btcResult.result.txid +
                  ', ' +
                  JSON.stringify(btcResult)
              )
            }
          } catch (e) {
            logger.error('BTC core HTTP error')
            throw e
          }
        })
      } else if (appBtcConfirmedBalance > userTx.amount) {
        logger.error(
          `ALERT: BALANCE MISMATCH for ${userId}, balance more than btc core balance: ${appBtcConfirmedBalance} > ${
            userTx.amount
          }`
        )
      } else {
        logger.info(
          `Already synced, nothing to do for ${userId}: ${
            userTx.amount
          } = ${appBtcConfirmedBalance}`
        )
      }
    }
  }
}

export default new BtcRpc()
