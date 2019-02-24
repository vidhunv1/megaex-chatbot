import { Sequelize } from 'sequelize-typescript'
import logger from '../modules/logger'
import { CONFIG } from '../config'
import path = require('path')

export class DB {
  static instance: DB
  private sequelize!: Sequelize | null

  constructor() {
    if (DB.instance) {
      return DB.instance
    } else {
      DB.instance = this
    }

    if (!this.sequelize) {
      logger.warn('DB is not yet initialized')
    }
  }

  init() {
    try {
      const sequelize = new Sequelize({
        database: CONFIG.DB_DATABASE_NAME,
        host: CONFIG.DB_HOST,
        username: CONFIG.DB_USERNAME,
        password: CONFIG.DB_PASSWORD,
        port: parseInt(CONFIG.DB_PORT),
        dialect: 'postgres',
        logging: function(sql: any, _sequelizeObject: any) {
          logger.info(sql)
        }
      })
      sequelize.addModels([path.resolve('src/models/')])

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

export default new DB()
