import { WalletQueue } from './wallet/wallet-queue'

export * from './wallet/types'

export async function initializeQueues() {
  const walletQueue = new WalletQueue()
  await walletQueue.init()
}

export async function closeQueues() {
  const walletQueue = new WalletQueue()
  await walletQueue.close()
}
