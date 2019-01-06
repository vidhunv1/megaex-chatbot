const env = 'test'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import Wallet from '../models/wallet'
import Store from '../helpers/store'

import * as DatabaseConfig from '../../config/database.json'
import { Sequelize } from 'sequelize-typescript'
import MessageQueue from '../helpers/message-queue'

let createdUser: User, sequelize: any
let messageQueue: any

const initDB = async (): Promise<User> => {
  const redisStore = new Store()
  await redisStore.initSub()
  messageQueue = new MessageQueue()
  try {
    sequelize = new Sequelize({
      ...(<any>DatabaseConfig)[env],
      logging: function(_sql: any, _sequelizeObject: any) {}
    })
    sequelize.addModels([process.cwd() + '/src/models'])

    createdUser = await createUser()
    return createdUser
  } catch (e) {
    console.error('Error occured: ' + JSON.stringify(e))
    return createdUser
  }
}

const createUser = async () => {
  let user: User
  const newTelegramUser = new TelegramUser({
    id: Math.floor(Math.random() * 10000000),
    firstName: 'Test1',
    lastName: 'Test2',
    languageCode: 'en',
    username: 'test1'
  })
  const u = await newTelegramUser.create()

  user = u.user
  user.telegramUser = u

  const createWallets = new Wallet({ userId: user.id })
  const wallets = await createWallets.create()
  if (wallets) user.wallets = wallets
  return user
}

const closeDB = async () => {
  await createdUser.telegramUser.destroy()
  for (let i = 0; i < createdUser.wallets.length; i++) {
    await createdUser.wallets[i].destroy()
  }
  await createdUser.destroy()
  await sequelize.close()
  await messageQueue.close()
}

export { initDB, closeDB, createUser }
