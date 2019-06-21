export const TRADE_NAMESPACE = 'trade'

export enum TradeQueueName {
  RESOLVE_DISPUTE = 'RESOLVE_DISPUTE'
}

export interface TradeJob {
  [TradeQueueName.RESOLVE_DISPUTE]: {
    disputeId: number
    winnerUserId: number
  }
}
