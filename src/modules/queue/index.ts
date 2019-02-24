import { WalletQueue } from './wallet/WalletQueue'
import { initWalletMockConsumers } from './wallet/mock'
import { CONFIG } from '../../config'
import logger from '../logger'

export * from './wallet/types'

export async function initializeQueues() {
  const walletQueue = new WalletQueue()
  await walletQueue.init()

  // MOCKS

  if (CONFIG.NODE_ENV === 'development') {
    logger.warn('Initializing mock consumers')
    initWalletMockConsumers()
  }
}

export async function closeQueues() {
  const walletQueue = new WalletQueue()
  await walletQueue.close()
}
