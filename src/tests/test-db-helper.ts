let env = 'test';
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import Wallet from '../models/wallet'
import Store from '../helpers/store'

import * as DatabaseConfig from '../../config/database.json'
import { Sequelize } from 'sequelize-typescript'
import MessageQueue from '../helpers/message-queue'

let createdUser:User, sequelize: any;
let messageQueue: any;

let initDB = async (): Promise<User> => {
  let redisStore = new Store();
  await redisStore.initSub();
  messageQueue = new MessageQueue();
  try {
    sequelize = new Sequelize({
      ...(<any>DatabaseConfig)[env], logging: function (_sql: any, _sequelizeObject: any) {
      }
    });
    sequelize.addModels([process.cwd() + '/src/models']);

    createdUser = await createUser();
    return createdUser;
  } catch (e) {
    console.error("Error occured: " + JSON.stringify(e));
    return createdUser;
  }
}

let createUser = async () => {
  let user:User;
  let newTelegramUser = new TelegramUser({
    id: Math.floor(Math.random() * 10000000), firstName: 'Test1', lastName: 'Test2', languageCode: 'en', username: 'test1'
  })
  let u = await newTelegramUser.create()

  user = u.user;
  user.telegramUser = u;

  let createWallets = new Wallet({ userId: user.id });
  let wallets = await createWallets.create();
  console.log("Wallets: " + JSON.stringify(wallets));
  if (wallets)
    user.wallets = wallets;  
  return user;
}

let closeDB = async () => {
  await createdUser.telegramUser.destroy();
  for (let i = 0; i < createdUser.wallets.length; i++) {
    await createdUser.wallets[i].destroy();
  }
  await createdUser.destroy();
  await sequelize.close();
  await messageQueue.close();
}

export {initDB, closeDB, createUser};