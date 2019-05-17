import { CONFIG } from '../../config'
import { RpcClient, RpcResult } from 'modules/RpcClient'

export enum BtcCommands {
  GET_NEW_ADDRESS = 'getnewaddress'
}

interface BtcParams {
  [BtcCommands.GET_NEW_ADDRESS]: []
}

interface BtcResult {
  [BtcCommands.GET_NEW_ADDRESS]: string // address
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
