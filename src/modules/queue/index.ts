import { WalletQueue } from './wallet/WalletQueue'

export * from './wallet/types'

export async function initializeQueues() {
  console.log('Init wallet queue')
  new WalletQueue()
}

export async function closeQueues() {
  const walletQueue = new WalletQueue()
  await walletQueue.close()
}
