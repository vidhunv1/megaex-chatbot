import { CONFIG } from '../../config'
import * as _ from 'lodash'
// const BigNumber = require('bignumber.js')
import logger from 'modules/logger'
const Web3 = require('web3')

// const oneEther = new BigNumber(1000000000000000000)
// const minSendAllowance = oneEther.divide(100)

export class EthWallet {
  web3Client!: any
  static instance: EthWallet
  constructor() {
    if (EthWallet.instance) return EthWallet.instance

    this.web3Client = new Web3(
      new Web3.providers.HttpProvider(CONFIG.ETH_PROVIDER)
    )

    EthWallet.instance = this
  }

  async generateAddress(): Promise<string | null> {
    logger.info('Generating ETH address')
    const accountPass = CONFIG.ETH_PASS

    try {
      return await this.web3Client.eth.personal.newAccount(accountPass)
    } catch (error) {
      logger.error('Error generating ETH address')
      logger.info(error.stack)
      return null
    }
  }

  async isValidAddress(address: string): Promise<boolean | null> {
    try {
      return this.web3Client.isAddress('' + address)
    } catch (error) {
      logger.error('Error ETH validating address: ' + address)
      return null
    }
  }

  async getBalance(address: string): Promise<number | null> {
    logger.info('Getting ETH balance for address:' + address)

    try {
      const result = await this.web3Client.eth.getBalance(address)
      const balance = parseFloat(
        this.web3Client.utils.fromWei(result).toString()
      )

      return balance
    } catch (e) {
      logger.error('Unable to get ETH balance for account')
      return null
    }
  }
}

export default new EthWallet()
