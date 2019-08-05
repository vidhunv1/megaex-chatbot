export const TRADE_NAMESPACE = 'trade'

export enum CommonQueueName {
  SEND_MESSAGE = 'SEND_MESSAGE'
}

export interface TelegramButton {
  title: string
  url: string
}

export interface CommonJob {
  [CommonQueueName.SEND_MESSAGE]: {
    userIdList: number[]
    title: {
      text: string
      isTransKey: boolean
    }
    message: {
      text: string
      isTransKey: boolean
      button?: TelegramButton[][]
    }
  }
}
