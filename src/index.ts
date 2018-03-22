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
import TelegramHandler from './helpers/t-message-handler' 

let env = process.env.NODE_ENV || 'development';

let logger = (new Logger()).getLogger();
logger.info('Starting app...');

// ****** Initialize Sequelize database with Postgres ******
logger.info('Initializing database');
let sequelize = new Sequelize({
  ...(<any>DatabaseConfig)[env], logging: function (sql:any, _sequelizeObject:any) {
    logger.info(sql);
  }
});
sequelize.addModels([__dirname + '/models/']);

// ****** Initialize Redis client ******
let redisStore = new Store();
const redisClient: any = redisStore.getClient();

/* ***** DEBUG ***** */
const { exec } = require('child_process');
exec(`telegram-send --pre "reload ${(new Date()).toLocaleTimeString()}"`);
/* ***** DEBUG ***** */

// load balancer ping test
var app = Express()
app.get('/', function (_, res) {
  res.send('pong')
})
app.listen(89)

let tBot = (new TelegramBotApi()).getBot();
let messageQueue = new MessageQueue();
let tMessageHandler = new TelegramHandler();


tBot.on('message', async function onMessage(msg: TelegramBot.Message) {
  let rKeys = (new CacheKeys(msg.chat.id)).getKeys();
  if (msg.from && msg.chat && msg.chat.id === msg.from.id) {
    tBot.sendChatAction(msg.chat.id, 'typing');

    let userCache = (await redisClient.getAsync(rKeys.telegramUser.key));
    if (userCache) { //user exists in redis cache
      let cache:TelegramUser = JSON.parse(userCache);
      let tU:TelegramUser = new TelegramUser(cache);
      tU.user = new User(cache.user);
      tMessageHandler.handleMessage(msg, tU.user, tU);
    } else { // no user data available in cache
      //check if user exists
      let tUser = await TelegramUser.findById(msg.from.id, { include: [{ model: User }] });
      if (!tUser) { // new user, create account & load cache
        let newT = new TelegramUser({ id: msg.from.id, firstName: msg.from.first_name, lastName: msg.from.last_name, languageCode: msg.from.language_code, username: msg.from.username })
        try {
          logger.info("Creating new account...")
          tUser = await newT.create();
        } catch (e) {
          logger.error("Error creating account: TelegramUser.create: " + JSON.stringify(e));
          tBot.sendMessage(msg.chat.id, (new User()).__('error_unknown'));
          return;
        }

        //create all wallets for user
        let btcWallet = new Wallet({ userId: tUser.user.id });
        btcWallet.create();

        tMessageHandler.handleMessage(msg, tUser.user, tUser);
      } else { // user account exists, load data to cache in next step
        tMessageHandler.handleMessage(msg, tUser.user, tUser);
        // tBot.sendMessage(msg.chat.id, tUser.user.__());
      }
      await redisClient.setAsync(rKeys.telegramUser.key, JSON.stringify(tUser), 'EX', rKeys.telegramUser.expiry);
    }

    if ((await redisClient.existsAsync(rKeys.messageCounter.shadowKey) == 1)) {
      await redisClient.incrAsync(rKeys.messageCounter.key);
    } else {
      await redisClient.setAsync(rKeys.messageCounter.key, 1);
      await redisClient.setAsync(rKeys.messageCounter.shadowKey, '', 'EX', rKeys.messageCounter.expiry);
    }
  } else if (msg.chat.type === 'group') {
    tBot.sendMessage(msg.chat.id, 'Group conversations are temporarily disabled.');
  } else {
    tBot.sendMessage(msg.chat.id, 'An error occured. Please try again later.');
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
