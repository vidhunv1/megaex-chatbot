import * as TelegramBot from 'node-telegram-bot-api';
import * as Express from 'express'
import { Sequelize } from 'sequelize-typescript';
import TelegramBotApi from './helpers/telegram-bot-api'
import MessageQueue from './helpers/message-queue';

import User from './models/user'
import TelegramUser from './models/telegram_user'
import Wallet from './models/wallet'

import * as DatabaseConfig from '../config/database.json'
import CacheKeys from './cache-keys'
import Store from './helpers/store';
import Logger from './helpers/logger'
import TelegramHandler from './t-conversation/router'
import Payment from './models/payment';

let env = process.env.NODE_ENV || 'development';

let logger = (new Logger()).getLogger();
logger.info('starting app ...');
/* ***** DEBUG ***** */
const { exec } = require('child_process');
exec(`telegram-send --pre "reload ${(new Date()).toLocaleTimeString()}"`);
/* ***** DEBUG ***** */

// load balancer ping test
var app = Express()
app.get('/', function (_, res) {
  res.send('pong')
})
app.listen(89);

(async () => {
  // ****** Initialize Sequelize database with Postgres ******
  logger.info('Initializing database');
  let sequelize = new Sequelize({
    ...(<any>DatabaseConfig)[env], logging: function (sql: any, _sequelizeObject: any) {
      logger.info(sql);
    }
  });
  sequelize.addModels([__dirname + '/models/']);

  // ****** Initialize Redis client ******
  let redisStore = new Store();
  await redisStore.initSub();
  const redisClient: any = redisStore.getClient();
  let tBot = (new TelegramBotApi()).getBot();
  let messageQueue = new MessageQueue();
  let tMessageHandler = new TelegramHandler();

  tBot.on('message', async function onMessage(msg: TelegramBot.Message) {
    console.log("Received message: ");
    try {
      let rKeys = (new CacheKeys(msg.chat.id)).getKeys();
      if (msg.from && msg.chat && msg.chat.id === msg.from.id) {
        await tBot.sendChatAction(msg.chat.id, 'typing');
        let userCache = (await redisClient.getAsync(rKeys.telegramUser.key));
        let tUser: TelegramUser, user: User;
        if (userCache) { //user exists in redis cache
          let cache: TelegramUser = JSON.parse(userCache);
          tUser = new TelegramUser(cache);
          user = new User(cache.user);
          console.log("UserCache: " + JSON.stringify(cache));
        } else { // no user data available in cache
          //check if user exists
          let getTUser = await TelegramUser.findById(msg.from.id, { include: [{ model: User }] });
          if (!getTUser) { // new user, create account & load cache
            let newT = new TelegramUser({ id: msg.from.id, firstName: msg.from.first_name, lastName: msg.from.last_name, languageCode: msg.from.language_code, username: msg.from.username })
            try {
              logger.info("Creating new account...")
              tUser = await newT.create();
              tUser.user.id = tUser.userId;
              user = tUser.user;
            } catch (e) {
              logger.error("Error creating account: TelegramUser.create: " + JSON.stringify(e));
              tBot.sendMessage(msg.chat.id, (new User()).__('error_unknown'));
              return;
            }
            //create all wallets for user
            let wallets = new Wallet({ userId: tUser.user.id });
            wallets.create();
          } else {
            tUser = getTUser;
            user = tUser.user;
          }
          console.log("SAVING TO CACHE: " + JSON.stringify(tUser));
          redisClient.setAsync(rKeys.telegramUser.key, JSON.stringify(tUser), 'EX', rKeys.telegramUser.expiry);
        }
        tMessageHandler.handleMessage(msg, user, tUser);
  
        if ((await redisClient.existsAsync(rKeys.messageCounter.shadowKey) == 1)) {
          await redisClient.incrAsync(rKeys.messageCounter.key);
        } else {
          await redisClient.setAsync(rKeys.messageCounter.key, 1);
          await redisClient.setAsync(rKeys.messageCounter.shadowKey, '', 'EX', rKeys.messageCounter.expiry);
        }
      } else if (msg.chat.type === 'group') {
        tBot.sendMessage(msg.chat.id, 'Group conversations are temporarily disabled.');
      } else {
        logger.error("Unhandled telegram message action");
        tBot.sendMessage(msg.chat.id, 'ERROR: Unhandled telegram message action');
      }
    } catch (e) {
      logger.error("FATAL: And unknown error occurred: " + JSON.stringify(e));
      tBot.sendMessage(msg.chat.id, 'An error occured. Please try again later.');
    }
  });
  
  tBot.on("callback_query", async function (callback) {
    await tBot.answerCallbackQuery(callback.id);
  
    let msg: TelegramBot.Message = callback.message, tUser: TelegramUser | null = null, user: User | null = null;
    let cacheKeys = (new CacheKeys(msg.chat.id)).getKeys();
    let userCache = (await redisClient.getAsync(cacheKeys.telegramUser.key));
  
    if (userCache) { //user exists in redis cache
      let cache: TelegramUser = JSON.parse(userCache);
      tUser = new TelegramUser(cache);
      user = new User(cache.user);
    } else { // get from db
      try {
        tUser = await TelegramUser.findById(msg.chat.id, { include: [{ model: User }] });
        user = tUser ? tUser.user : null;
      } catch (e) {
        logger.error("FATAL: could not get user details");
      }
    }
  
    if (tUser && user) {
      tMessageHandler.handleCallbackQuery(callback.message, user, tUser, callback);
    } else {
      logger.error("FATAL: user does not exist when it should have");
    }
  });
  
  process.on('SIGINT', async function () {
    logger.info("Ending process...");
    logger.info("closing sql");
    await sequelize.close();
    await redisStore.close();
    await messageQueue.close();
    process.exit(0);
  });
})();

// Initialization tasks
Payment.deleteExpiredPayments();