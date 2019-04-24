export enum ExchangeHomeStateKey {
  start = 'start',
  exchange = 'exchange'
}

export interface ExchangeHomeState {
  [ExchangeHomeStateKey.start]?: {
    data: {} | null
  }
}
