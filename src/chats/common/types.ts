export enum CommonStateKey {
  cb_deleteThisMessage = 'cb_deleteThisMessage',
  cb_contactLegal = 'cb_contactLegal',
  cb_contactSupport = 'cb_contactSupport'
}

export interface CommonState {
  [CommonStateKey.cb_deleteThisMessage]?: {}
  [CommonStateKey.cb_contactSupport]?: {
    userId: number
  }
  [CommonStateKey.cb_contactLegal]?: {
    userId: number
    tradeId: number
  }
}
