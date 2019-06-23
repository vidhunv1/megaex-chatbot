import { Sequelize } from 'sequelize-typescript'
import { logger } from 'modules'
import {
  TelegramAccount,
  User,
  Wallet,
  Transaction,
  Transfer,
  PaymentMethod,
  Order,
  Referral,
  UserInfo,
  Withdrawal,
  Market,
  Trade,
  Dispute,
  Message
} from 'models'
import { CONFIG } from '../config'

export class DB {
  static instance: DB
  private sequelize!: Sequelize | null

  constructor() {
    if (DB.instance) {
      return DB.instance
    } else {
      DB.instance = this
      this.init()
    }
  }

  init() {
    try {
      let dialectOptions = {}
      if (CONFIG.NODE_ENV === 'production') {
        dialectOptions = {
          ssl: {
            require: true
          }
        }
      }
      const sequelize = new Sequelize({
        url: CONFIG.DB_URL,
        dialect: 'postgres',
        dialectOptions,
        logging: function(sql: any, _sequelizeObject: any) {
          logger.info(sql)
        }
      })
      sequelize.addModels([
        Wallet,
        Transaction,
        Transfer,
        PaymentMethod,
        Order,
        Withdrawal,
        Market,
        Trade,
        Dispute,
        Message,

        User,
        TelegramAccount,
        Referral,
        UserInfo
      ])

      DB.instance = this
      logger.info('OK: DB')
    } catch (e) {
      logger.error('Error: DB')
      throw e
    }
  }

  close() {
    if (!this.sequelize) {
      logger.error('Sequelize db not initialized')
    } else {
      this.sequelize.close()
      this.sequelize = null
    }
  }
}
