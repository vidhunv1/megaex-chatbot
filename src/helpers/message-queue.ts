import * as Kue from 'kue'
import User from '../models/user'
import * as JWT from 'jsonwebtoken';

import * as RedisConfig from '../../config/redis.json'
import * as AppConfig from '../../config/app.json'
import TelegramBotApi from './telegram-bot-api'
import TelegramUser from '../models/telegram_user';
import Transaction from '../models/transaction';
import Logger from './logger'
import TMessageHandler from '../helpers/t-message-handler'

var env = process.env.NODE_ENV || 'development';

export default class MessageQueue {
  static instance: MessageQueue;
  queue!: Kue.Queue

  constructor() {
    if (MessageQueue.instance)
      return MessageQueue.instance;

    this.queue = Kue.createQueue({
      prefix: 'q',
      db: (<any>RedisConfig)[env]['database'],
      redis: {
        host: (<any>RedisConfig)[env]['host'],
        port: (<any>RedisConfig)[env]['port']
      }
    });
    this.createNotificationHandler();

    MessageQueue.instance = this;
  }

  generateBtcAddress(id: number): Promise<string> {
    let logger = (new Logger()).getLogger();

    logger.info("generate btc address");
    let q = this.queue;
    let jwtSecret = (<any>AppConfig)["jwt_secret"];
    const promise = new Promise(function (resolve: (address: string) => any, reject) {
      let job = q.create('btc.generateAddress', { id: id })
        .attempts(999999)
        .save(function (err: any) {
          if (err) {
            reject(new Error('Error creating job'));
          }
        });

      job.on('complete', function (addressSignature) {
        try {
          var decoded = JWT.verify(addressSignature, jwtSecret);
          resolve(decoded);
        } catch (err) {
          if (err.name === "JsonWebTokenError")
            logger.error("generateBtcAddress could not verify token, invalid signature probably");
          reject(new Error('Could not verify signature'));
        }
      }).on('failed attempt', function (_errorMessage, _doneAttempts) {
      }).on('failed', function (errorMessage) {
        reject(new Error(errorMessage))
      }).on('progress', function (_progress, _data) {
      });
    })
    return promise;
  }

  createNotificationHandler() {
    let logger = (new Logger()).getLogger();
    logger.info("MessageQueue initializing notification handler");

    let tBot = (new TelegramBotApi()).getBot();
    this.queue.process('notification.newTransaction', 4, async function(job, done) {
      logger.info("New notification: "+JSON.stringify(job));
      let transaction = (await Transaction.findAll({
        limit: 1,
        where: {
          transactionId: job.data.transactionId
        }
      }))[0];

      let user = await User.findById(transaction.userId, {include: [TelegramUser]});
      
      console.log(JSON.stringify(user));
      if(user) {
        let message = '';
        if(transaction.transactionType === "receive") {
          message = user.__('new_transaction_credit %s %s %s %s', user.__(transaction.currencyCode), transaction.amount, transaction.currencyCode, transaction.transactionId);
        } else {
          message = 'Your send request '+transaction.amount+' '+transaction.currencyCode+' was successful. Txid: '+transaction.transactionId; 
        }
        await tBot.sendMessage(user.telegramUser.id, message, {parse_mode: 'Markdown'});
        let tHandler = new TMessageHandler();
        tHandler.handleWallet(null, user, user.telegramUser);
      }
      done(null);
    });
  }

  async close() {
    let logger = (new Logger()).getLogger();

    let q = this.queue;
    return new Promise(function(resolve, _reject) {
      q.shutdown(0, function(err:any) {
        logger.info( 'Kue is shut down.', err||'' );
        resolve();
      })
    })
  }
}
