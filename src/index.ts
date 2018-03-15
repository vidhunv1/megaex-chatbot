import * as TelegramBot from 'node-telegram-bot-api';
import * as Express from 'express'
import { Sequelize } from 'sequelize-typescript';
import User from './models/user'
import TelegramUser from './models/telegram_user'

import * as DatabaseConfig from '../config/database.json'
import * as AppConfig from '../config/app.json'

var env = process.env.NODE_ENV || 'development';
var sequelize = new Sequelize((<any>DatabaseConfig)[env]);
sequelize.addModels([__dirname + '/models/']);

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
}});

bot.setWebHook(`${(<any>AppConfig)["telegram_bot_url"]+':'+(<any>AppConfig)["telegram_bot_port"]}/bot${(<any>AppConfig)["telegram_access_token"]}`);

bot.on('message', async function onMessage(msg: TelegramBot.Message) {
  if (msg.from && msg.chat && msg.chat.id === msg.from.id) {
    bot.sendChatAction(msg.chat.id, 'typing');
    console.time('dbread');
    let tUser = await TelegramUser.findById(msg.from.id); // TODO: replace with redis call
    console.timeEnd('dbread');
    if (tUser) {
      bot.sendMessage(msg.chat.id, `Welcome back ${tUser.firstName}!`);
    } else {
        tUser = await TelegramUser.findById(msg.from.id, { include: [{ model: User }] });
        if (!tUser) {
          tUser = (await User.create<User>({ telegramUser: {id: msg.from.id, firstName: msg.from.first_name, lastName: msg.from.last_name, languageCode: msg.from.language_code, username: msg.from.username}}, {
            include: [{ model: TelegramUser}]
          })).telegramUser
          bot.sendMessage(msg.chat.id, `Hello ${tUser.firstName}. Get started with megaex bot for trading bitcoins.`);
        } else {
          bot.sendMessage(msg.chat.id, `Welcome back ${tUser.firstName}!`);
        }
    }
  } else if (msg.chat.type === 'group') {
    bot.sendMessage(msg.chat.id, 'Group conversations are temporarily disabled.');
  } else {
    bot.sendMessage(msg.chat.id, 'An error occured. Please try again later.');
  }
});
