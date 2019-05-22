import { Sequelize } from 'sequelize-typescript'
import { logger } from 'modules'
import {
  TelegramAccount,
  User,
  Wallet,
  Transaction,
  PaymentMethod,
  Order,
  Referral,
  UserInfo
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

    if (!this.sequelize) {
      logger.warn('DB is not yet initialized')
    }
  }

  init() {
    try {
      const sequelize = new Sequelize({
        url: CONFIG.DB_URL,
        dialect: 'postgres',
        logging: function(sql: any, _sequelizeObject: any) {
          logger.info(sql)
        }
      })
      sequelize.addModels([
        Wallet,
        Transaction,
        PaymentMethod,
        Order,

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
