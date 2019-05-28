import { CONFIG } from '../../config'
import { RpcClient, RpcResult } from 'modules/rpcClient'

export enum BtcCommands {
  GET_NEW_ADDRESS = 'getnewaddress',
  GET_TRANSACTION = 'gettransaction'
}

interface BtcParams {
  [BtcCommands.GET_NEW_ADDRESS]: [string] // account address
  [BtcCommands.GET_TRANSACTION]: [string] // in-wallet transaction id
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
}

export default new BtcRpc()
