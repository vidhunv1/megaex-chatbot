import * as Kue from "kue";
import * as JWT from "jsonwebtoken";

import * as RedisConfig from "../../config/redis.json";
import * as AppConfig from "../../config/app.json";
import NotificationManager from "./notification-manager";
import Logger from "./logger";

var env = process.env.NODE_ENV || "development";
console.log("ENV: " + process.env.NODE_ENV);

export default class MessageQueue {
  static instance: MessageQueue;
  queue!: Kue.Queue;
  notificationManager!: NotificationManager;
  logger!: any;

  constructor() {
    if (MessageQueue.instance) return MessageQueue.instance;
    this.logger = new Logger().getLogger();

    this.queue = Kue.createQueue({
      prefix: "q",
      db: (<any>RedisConfig)[env]["database"],
      redis: {
        host: (<any>RedisConfig)[env]["host"],
        port: (<any>RedisConfig)[env]["port"]
      }
    });
    this.createNotificationHandler();
    this.notificationManager = new NotificationManager();
    MessageQueue.instance = this;
  }

  generateBtcAddress(id: number): Promise<string> {
    this.logger.info("generate btc address");
    let q = this.queue;
    let jwtSecret = (<any>AppConfig)[env]["jwt_secret"];
    let _this = this;
    const promise = new Promise(function(
      resolve: (address: string) => any,
      reject
    ) {
      let job = q
        .create("btc.generateAddress", { id: id })
        .attempts(999999)
        .save(function(err: any) {
          if (err) {
            reject(new Error("Error creating job"));
          }
        });
      job
        .on("complete", function(addressSignature) {
          try {
            var decoded = JWT.verify(addressSignature, jwtSecret);
            resolve(decoded);
          } catch (err) {
            if (err.name === "JsonWebTokenError")
              _this.logger.error(
                "generateBtcAddress could not verify token, invalid signature probably"
              );
            reject(new Error("Could not verify signature"));
          }
        })
        .on("failed attempt", function(_errorMessage, _doneAttempts) {})
        .on("failed", function(errorMessage) {
          reject(new Error(errorMessage));
        })
        .on("progress", function(_progress, _data) {});
    });
    return promise;
  }

  createNotificationHandler() {
    this.logger.info("MessageQueue initializing main notification handler");
    let _this = this;
    this.queue.process("notification", 4, async function(job, done) {
      let notificationType = job.data.notificationType;
      _this.notificationManager.sendNotification(notificationType, job.data);
      done(null);
    });
  }

  async close() {
    let q = this.queue;
    let _this = this;
    return new Promise(function(resolve, _reject) {
      q.shutdown(0, function(err: any) {
        _this.logger.info("Kue is shut down.", err || "");
        resolve();
      });
    });
  }
}
