export enum CommonStateKey {
  cb_deleteThisMessage = 'cb_deleteThisMessage'
}

export interface CommonState {
  [CommonStateKey.cb_deleteThisMessage]?: {}
}
