import * as TelegramBot from 'node-telegram-bot-api';
import * as Express from 'express'
const TOKEN = '533091025:AAEYbCc7meRtZN2DJlIYDyZ37BQSAJuGm5c'
const options = {
  webHook: {
    port: 88,
    key: '',
    cert: '',
    pfx: ''
  }
};

const url = 'https://megaex.io:88';
const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`);

// Just to ping!
bot.on('message', function onMessage(msg) {
  bot.sendMessage(msg.chat.id, 'Hello World');
});

// load balancer ping test
var app = Express()
app.get('/ping', function (req, res) {
  res.send('pong')
})

app.listen(89)