import { CONFIG } from '../config'
import { createLogger, format, transports } from 'winston'

export class Logger {
  static instance: Logger
  logger: any

  constructor() {
    if (Logger.instance) return Logger.instance
    const env = CONFIG.NODE_ENV

    this.logger = createLogger({
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.splat(),
        format.json()
      ),
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' }), // log error and warn
        new transports.File({ filename: 'combined.log' }) // log all
      ]
    })

    if (env !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(
            format.timestamp({ format: 'DD HH:mm:ss' }),
            format.colorize(),
            format.simple()
          )
        })
      )
    }

    Logger.instance = this
  }

  get getLogger() {
    return this.logger as {
      info: (s: string) => any
      warn: (s: string) => any
      error: (s: string) => any
    }
  }
}

export default new Logger().getLogger
