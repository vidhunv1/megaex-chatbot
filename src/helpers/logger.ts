const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
export default class Logger {
  static instance: Logger;
  logger: any;

  constructor() {
    if (Logger.instance) return Logger.instance;

    let env = process.env.NODE_ENV || "development";

    const myFormat = printf((info: any) => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    });

    this.logger = createLogger({
      format: combine(timestamp(), myFormat),
      transports: [
        new transports.File({ filename: "logs/error.log", level: "warn" }), //log error and warn
        new transports.File({ filename: "logs/combined.log" }) //log all
      ]
    });

    if (env !== "production") {
      this.logger.add(
        new transports.Console({
          format: format.simple()
        })
      );
    }

    Logger.instance = this;
  }

  getLogger() {
    return this.logger;
  }
}
