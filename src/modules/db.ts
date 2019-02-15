import { Sequelize } from 'sequelize-typescript'
import logger from '../modules/logger'
import { CONFIG } from '../config'
import path = require('path')

export class DB {
  static instance: DB
  sequelize!: Sequelize | null

  constructor() {
    if (DB.instance) {
      return DB.instance
    }
  }

  init() {
    logger.info('Initializing database')

    const sequelize = new Sequelize({
      database: CONFIG.DB_DATABASE_NAME,
      host: CONFIG.DB_HOST,
      username: CONFIG.DB_USERNAME,
      password: CONFIG.DB_PASSWORD,
      dialect: 'postgres',
      logging: function(sql: any, _sequelizeObject: any) {
        logger.info(sql)
      }
    })
    sequelize.addModels([path.resolve('src/models/')])
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
