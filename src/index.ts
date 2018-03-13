import * as TelegramBot from 'node-telegram-bot-api';
import * as Express from 'express'
import { Sequelize } from 'sequelize-typescript';
import User from './models/user'
import TelegramUser from './models/telegram_user'

import * as DatabaseConfig from '../config/database.json'
import * as AppConfig from '../config/app.json'
import { redisKeys } from './keys'
import Store from './helpers/store';

var env = process.env.NODE_ENV || 'development';
var sequelize = new Sequelize((<any>DatabaseConfig)[env]);
sequelize.addModels([__dirname + '/models/']);

let redisStore = new Store();
const redisClient: any = redisStore.getClient();

const { exec } = require('child_process');
exec(`telegram-send --pre "reload ${(new Date()).toLocaleTimeString()}"`);

// load balancer ping test
var app = Express()
app.get('/', function (_, res) {
  res.send('pong')
})
app.listen(89)

const bot = new TelegramBot((<any>AppConfig)["telegram_access_token"], {
  webHook: {
    port: (<any>AppConfig)["telegram_bot_port"],
    key: '',
    cert: '',
    pfx: ''
  }
});

bot.setWebHook(`${(<any>AppConfig)["telegram_bot_url"] + ':' + (<any>AppConfig)["telegram_bot_port"]}/bot${(<any>AppConfig)["telegram_access_token"]}`);

bot.on('message', async function onMessage(msg: TelegramBot.Message) {
  if (msg.from && msg.chat && msg.chat.id === msg.from.id) {
    try {
      bot.sendChatAction(msg.chat.id, 'typing');
      // let counterKey = msg.from.id + ':' + RedisKeys.messageCounter.key;
      // let userHMKey = msg.from.id + ':' + RedisKeys.userHM.key;

      let firstName = (await redisClient.hmgetAsync(redisKeys(msg.from.id).userHM.key, redisKeys(msg.from.id).userHM.firstName))[0];
      if (firstName) { //user exists in redis cache
        bot.sendMessage(msg.chat.id, `Welcome back ${firstName}!`);
      } else { // no user data available in cache

        //check if user exists
        let tUser = await TelegramUser.findById(msg.from.id, { include: [{ model: User }] });
        if (!tUser) { // new user, create account & load cache
          let newT = new TelegramUser({ id: msg.from.id, firstName: msg.from.first_name, lastName: msg.from.last_name, languageCode: msg.from.language_code, username: msg.from.username })
          tUser = await newT.create();
          bot.sendMessage(msg.chat.id, `Hello ${tUser.firstName}. Get started with megaex bot for trading bitcoins.`);
        } else { // user account exists, load data to cache in next step
          bot.sendMessage(msg.chat.id, `Welcome back ${tUser.firstName}!`);
        }
        let fromId = msg.from.id;
        //Load user data to cache
        var values: string[] = [];
        if (tUser.firstName)
          values.push(redisKeys(msg.from.id).userHM.firstName, tUser.firstName);
        if (tUser.lastName)
          values.push(redisKeys(msg.from.id).userHM.lastName, tUser.lastName);
        if (tUser.username)
          values.push(redisKeys(msg.from.id).userHM.telegramUsername, tUser.username);
        if (tUser.user.accountId)
          values.push(redisKeys(msg.from.id).userHM.accountId, tUser.user.accountId);
        if (tUser.user.language)
          values.push(redisKeys(msg.from.id).userHM.language, tUser.user.language);
        if (tUser.user.currencyCode)
          values.push(redisKeys(msg.from.id).userHM.currencyCode, tUser.user.currencyCode);
        redisClient.hmsetAsync(redisKeys(msg.from.id).userHM.key, values)
          .then((_: any, __: any) => {
            redisClient.expireAsync(redisKeys(fromId).userHM.key, redisKeys(fromId).userHM.expiry)
          });
      }

      if ((await redisClient.existsAsync(redisKeys(msg.from.id).messageCounter.shadowKey) == 1)) {
        await redisClient.incrAsync(redisKeys(msg.from.id).messageCounter.key);
      } else {
        await redisClient.setAsync(redisKeys(msg.from.id).messageCounter.key, 1);
        await redisClient.setAsync(redisKeys(msg.from.id).messageCounter.shadowKey, '', 'EX', redisKeys().messageCounter.expiry);
      }
    } catch (e) {
      console.error("ERROR" + JSON.stringify(e));
      exec(`telegram-send --pre "ERROR!! ${JSON.stringify(e)}"`);
      bot.sendMessage(msg.chat.id, 'An error occured. Please try again.');
    }
  } else if (msg.chat.type === 'group') {
    bot.sendMessage(msg.chat.id, 'Group conversations are temporarily disabled.');
  } else {
    bot.sendMessage(msg.chat.id, 'An error occured. Please try again later.');
  }
});