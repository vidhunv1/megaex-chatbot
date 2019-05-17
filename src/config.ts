const getEnv = (key: string): string => {
  const e = process.env[key]
  if (e !== null && e !== undefined) {
    return e
  } else {
    console.error(
      `Envirnoment variable ${key} not found. Provide this and start app again.`
    )
    process.exit(0)
    throw Error()
  }
}

export const CONFIG = {
  NODE_ENV: getEnv('NODE_ENV'),
  TELEGRAM_ACCESS_TOKEN: getEnv('TELEGRAM_ACCESS_TOKEN'),
  BOT_USERNAME: getEnv('BOT_USERNAME'),
  SUPPORT_USERNAME: getEnv('SUPPORT_USERNAME'),
  WEBHOOK_URL: getEnv('WEBHOOK_URL'),
  WEBHOOK_PORT: parseInt(getEnv('WEBHOOK_PORT')),

  DB_USERNAME: getEnv('DB_USERNAME'),
  DB_PASSWORD: getEnv('DB_PASSWORD'),
  DB_HOST: getEnv('DB_HOST'),
  DB_PORT: getEnv('DB_PORT'),
  DB_DATABASE_NAME: getEnv('DB_DATABASE_NAME'),

  REDIS_HOST: getEnv('REDIS_HOST'),
  REDIS_PORT: getEnv('REDIS_PORT'),
  REDIS_DATABASE: getEnv('REDIS_DATABASE'),
  REDIS_PASSWORD: getEnv('REDIS_PASSWORD'),

  BTC_NODE_HOST: getEnv('BTC_NODE_HOST'),
  BTC_NODE_PORT: getEnv('BTC_NODE_PORT'),
  BTC_NODE_USERNAME: getEnv('BTC_NODE_USERNAME'),
  BTC_NODE_PASSWORD: getEnv('BTC_NODE_PASSWORD')
}
