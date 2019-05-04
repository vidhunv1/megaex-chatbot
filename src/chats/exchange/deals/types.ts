import { OrderType } from 'models'

export enum DealsStateKey {
  cb_deals = 'cb_deals',
  deals_show = 'deals_show',
  cb_showDealById = 'cb_showDealById',
  showDealById = 'showDealById',
  cb_nextDeals = 'cb_nextDeals',
  cb_prevDeals = 'cb_prevDeals',

  cb_openDeal = 'cb_openDeal'
}

export interface DealsState {
  [DealsStateKey.cb_deals]?: {
    orderType: OrderType
  }

  [DealsStateKey.cb_showDealById]?: {
    orderId: number
  }

  [DealsStateKey.deals_show]?: {
    data: {
      cursor: number
      shouldEdit: boolean
    }
  }

  [DealsStateKey.cb_nextDeals]?: {
    cursor: number
  }
  [DealsStateKey.cb_prevDeals]?: {
    cursor: number
  }

  [DealsStateKey.cb_openDeal]?: {
    orderId: number
  }
}
