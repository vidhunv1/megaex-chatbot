import walletQueue, { ProducerTypes } from './WalletQueue'
import Queue = require('bull')
import { WalletJobs, WalletJobProducer } from './types'
import { CryptoCurrency } from '../../../constants/currencies'

export async function initWalletMockConsumers() {
  const queue = walletQueue.getQueue
  queue.process(WalletJobs.CREATE_ADDRESS, (jobs: Queue.Job<ProducerTypes>) => {
    console.log('Q-DATA: ' + JSON.stringify(jobs.data))

    const { userId } = jobs.data as WalletJobProducer['create-address']

    queue.add(WalletJobs.GENERATED_ADDRESS, {
      userId,
      address: (Math.random() * 1e16).toString(36),
      currency: CryptoCurrency.BTC
    })

    return Promise.resolve()
  })
}
