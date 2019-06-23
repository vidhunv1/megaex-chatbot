export enum AccountHomeStateKey {
  start = 'start',
  account = 'account',

  cb_showReviews = 'cb_showReviews',
  showReviews = 'showReviews',
  cb_reviewShowMore = 'cb_reviewShowMore',

  cb_sendMessage = 'cb_sendMessage',
  sendMessage = 'sendMessage',
  messageSent = 'messageSent'
}

export interface AccountHomeState {
  [AccountHomeStateKey.cb_showReviews]?: {
    accountId: string
  }

  [AccountHomeStateKey.showReviews]?: {
    data: {
      shouldEdit: boolean
      cursor: number
    }
  }

  [AccountHomeStateKey.cb_reviewShowMore]?: {
    cursor: number
  }

  [AccountHomeStateKey.cb_sendMessage]?: {
    toUserId: number
  }

  [AccountHomeStateKey.sendMessage]?: {
    sentMessage: string | null
  }
}

export enum AccountHomeError {
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND'
}
