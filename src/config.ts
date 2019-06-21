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
  LEGAL_USERNAME: getEnv('LEGAL_USERNAME'),
  WEBHOOK_URL: getEnv('WEBHOOK_URL'),
  WEBHOOK_PORT: parseInt(getEnv('WEBHOOK_PORT')),

  DB_URL: getEnv('DB_URL'),

  REDIS_HOST: getEnv('REDIS_HOST'),
  REDIS_PORT: getEnv('REDIS_PORT'),
  REDIS_DATABASE: getEnv('REDIS_DATABASE'),
  REDIS_PASSWORD: getEnv('REDIS_PASSWORD'),

  BTC_NODE_HOST: getEnv('BTC_NODE_HOST'),
  BTC_NODE_PORT: getEnv('BTC_NODE_PORT'),
  BTC_NODE_USERNAME: getEnv('BTC_NODE_USERNAME'),
  BTC_NODE_PASSWORD: getEnv('BTC_NODE_PASSWORD'),
  BTC_FEES: getEnv('BTC_FEES'),
  AMPQ_URL: getEnv('AMPQ_URL'),

  PAYMENT_EXPIRY_S: getEnv('PAYMENT_EXPIRY_S'),
  ADMIN_USERID: getEnv('ADMIN_USERID'),

  TRADE_INIT_TIMEOUT_S: getEnv('TRADE_INIT_TIMEOUT_S'),
  TRADE_ESCROW_TIMEOUT_S: getEnv('TRADE_ESCROW_TIMEOUT_S'),

  MAKER_FEES_PERCENTAGE: getEnv('MAKER_FEES_PERCENTAGE'),
  REFERRAL_COMISSION_PERCENTAGE: getEnv('REFERRAL_COMISSION_PERCENTAGE')
}
