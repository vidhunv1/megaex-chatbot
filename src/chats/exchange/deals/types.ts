import { OrderType, TradeErrorTypes } from 'models'
import { FiatCurrency } from 'constants/currencies'

export enum DealsStateKey {
  cb_deals = 'cb_deals',
  deals_show = 'deals_show',
  cb_showDealById = 'cb_showDealById',
  showDealById = 'showDealById',
  cb_nextDeals = 'cb_nextDeals',
  cb_prevDeals = 'cb_prevDeals',

  cb_openDeal = 'cb_openDeal',

  cb_requestDealDeposit = 'cb_requestDealDeposit',
  requestDealDeposit_show = 'requestDealDeposit_show',

  inputDealAmount = 'inputDealAmount',
  confirmInputDealAmount = 'confirmInputDealAmount',
  cb_confirmInputDealAmount = 'cb_confirmInputDealAmount',

  showDealInitOpened = 'showDealInitOpened',
  showDealInitCancel = 'showDealInitCancel',

  dealError = 'dealError',

  cb_respondToTradeInit = 'cb_respondToTradeInit',
  respondToTradeInit = 'respondToTradeInit',
  cb_cancelTrade = 'cb_cancelTrade',
  cancelTrade = 'cancelTrade',
  cb_confirmPaymentSent = 'cb_confirmPaymentSent',
  cb_confirmPaymentReceived = 'cb_confirmPaymentReceived',
  cb_paymentDispute = 'cb_paymentDispute'
}

export enum DealsError {
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  SELF_OPEN_DEAL_REQUEST = 'SELF_OPEN_DEAL_REQUEST',
  DEFAULT = 'DEFAULT'
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
    error?: DealsError | TradeErrorTypes
  }
  [DealsStateKey.cb_requestDealDeposit]?: {
    orderId: number
    error?: DealsError
  }

  [DealsStateKey.showDealInitOpened]?: {
    data: {
      tradeId: number
    } | null
  }

  [DealsStateKey.inputDealAmount]?: {
    orderId: number
    jumpState: DealsStateKey
    data: {
      fiatValue: number
      fiatCurrencyCode: FiatCurrency
      fixedRate: number
    } | null
  }

  [DealsStateKey.cb_confirmInputDealAmount]?: {
    isConfirmed: boolean
    data: {
      isInitialized: boolean
    } | null
    error?: DealsError | TradeErrorTypes
  }

  [DealsStateKey.cb_cancelTrade]?: {
    tradeId: number
  }
  [DealsStateKey.cancelTrade]?: {
    data: {
      canceledTradeId: number | null
    }
  }
  [DealsStateKey.cb_respondToTradeInit]?: {
    confirmation: 'yes' | 'no'
    tradeId: number
    data?: {
      openedTradeId: number | null
    } | null
    error?: TradeErrorTypes | DealsError | null
  }
  [DealsStateKey.cb_confirmPaymentSent]?: {
    tradeId: number
  }
  [DealsStateKey.cb_confirmPaymentReceived]?: {
    tradeId: number
  }
  [DealsStateKey.cb_paymentDispute]?: {}
}
