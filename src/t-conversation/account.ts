import * as TelegramBot from "node-telegram-bot-api";
import TelegramUser from "../models/telegram_user";
import Store from "../helpers/store";
import CacheStore from "../cache-keys";
import User from "../models/user";
import PaymentDetail from "../models/payment_detail";
import PaymentMethod from "../models/payment_method";
import TelegramBotApi from "../helpers/telegram-bot-api";
import * as moment from "moment";

import {
  stringifyCallbackQuery,
  keyboardMenu,
  sendErrorMessage,
  ICallbackQuery,
  ICallbackFunction
} from "./defaults";
import * as AppConfig from "../../config/app.json";
let env = process.env.NODE_ENV || "development";

let CONTEXT_SENDMESSAGE = "CONTEXT_SENDMESSAGE";
let CONTEXT_ADDPAYMETHOD = "CONTEXT_ADDPAYMETHOD";
let CONTEXT_ENTERPAYMETHOD = "CONTEXT_ENTERPAYMETHOD";
// let ENTER_PAYMETHOD_EXPIRY = 30;

let redisClient = new Store().getClient();
let tBot = new TelegramBotApi().getBot();
let accountConversation = async function(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramUser
): Promise<boolean> {
  if (msg.text && msg.text.startsWith("/u") && msg.entities) {
    let accountId = msg.text
      .substring(msg.entities[0].offset + 2, msg.entities[0].length)
      .toLowerCase();
    showAccount(accountId, msg, user, tUser);
    return true;
  } else if (msg.text && msg.text === user.__("menu_my_account")) {
    showMyAccount(msg, user, tUser);
    return true;
  } else if (msg.text && msg.text.startsWith("/start")) {
    let query = msg.text.replace("/start", "").replace(" ", ""),
      func,
      param;
    [func, param] = query.split("-");
    if (func === "ref") {
      //handle referrals
      handleReferrals(msg, user, tUser);
      return true;
    } else if (func === "acc") {
      //handle account
      showAccount(param, msg, user, tUser);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

let accountCallback = async function(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramUser,
  query: ICallbackQuery
): Promise<boolean> {
  let botUsername = (<any>AppConfig)[env]["telegram_bot_username"];
  let cacheKeys = new CacheStore(tUser.id).getKeys();
  switch (query.callbackFunction) {
    case "accountLink":
      await tBot.sendMessage(msg.chat.id, user.__("show_account_link_info"), {
        parse_mode: "Markdown"
      });
      await tBot.sendMessage(
        tUser.id,
        "https://t.me/" +
          botUsername +
          "?start=acc-" +
          user.accountId.toLowerCase(),
        {}
      );
      return true;
    case "referralLink":
      await tBot.sendMessage(msg.chat.id, user.__("show_referral_link_info"), {
        parse_mode: "Markdown"
      });
      await tBot.sendMessage(
        tUser.id,
        "https://t.me/" +
          botUsername +
          "?start=ref-" +
          user.accountId.toLowerCase(),
        {
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      );
      return true;
    case "addPayment":
      await redisClient.hmsetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.currentContext,
        CONTEXT_ADDPAYMETHOD
      );
      redisClient.expireAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.expiry
      );
      let payNames: string[] = await PaymentDetail.getPaymethodNames(user);
      let keyboard: TelegramBot.KeyboardButton[][] = [];
      for (let i = 0; i < payNames.length; i++) {
        keyboard.push([{ text: payNames[i] }]);
      }
      await tBot.sendMessage(msg.chat.id, user.__("paymethod_add"), {
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: keyboard,
          one_time_keyboard: false,
          resize_keyboard: true
        }
      });
      return true;
    case "showPayments":
      if (query.showPayments && query.showPayments.paymentId) {
        let pmName = user.__(
          "paymethod" + query.showPayments.paymentId + "_name"
        );
        let pmFields = await PaymentDetail.getLocaleFields(user, pmName);
        if (!pmFields) return true;
        let fields: string[] = [],
          pmethod = await PaymentMethod.findOne({
            where: { paymentId: query.showPayments.paymentId, userId: user.id }
          });
        if (!pmethod) return true;
        fields.push(
          pmethod.field1,
          pmethod.field2,
          pmethod.field3,
          pmethod.field4
        );
        let message: string = user.__("paymethod_show %s", pmName);
        for (let i = 0; i < pmFields.length; i++) {
          message =
            message +
            user.__("paymethod_field_show %s %s", pmFields[i], fields[i]);
        }
        pmFields &&
          (await tBot.sendMessage(tUser.id, message, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: user.__("delete"),
                    callback_data: stringifyCallbackQuery(
                      ICallbackFunction.DeletePayment,
                      null,
                      {
                        paymentId: await PaymentDetail.getPaymethodID(
                          user,
                          pmName
                        )
                      }
                    )
                  },
                  {
                    text: user.__("edit"),
                    callback_data: stringifyCallbackQuery(
                      ICallbackFunction.EditPayment,
                      null,
                      {
                        paymentId: await PaymentDetail.getPaymethodID(
                          user,
                          pmName
                        )
                      }
                    )
                  }
                ]
              ],
              one_time_keyboard: false,
              resize_keyboard: true
            }
          }));
      } else {
        let pmNames = await PaymentDetail.getPaymethodNames(user, true);
        let inline: TelegramBot.InlineKeyboardButton[][] = [];
        for (let i = 0; i < pmNames.length; i++) {
          inline.push([
            {
              text: pmNames[i],
              callback_data: stringifyCallbackQuery(
                ICallbackFunction.ShowPayments,
                null,
                {
                  paymentId: await PaymentDetail.getPaymethodID(
                    user,
                    pmNames[i]
                  )
                }
              )
            }
          ]);
        }
        inline.push([
          {
            text: user.__("add_another_payment_method"),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.AddPayment,
              null,
              null
            )
          }
        ]);
        tBot.sendMessage(tUser.id, user.__("list_payment_methods"), {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: inline,
            one_time_keyboard: false,
            resize_keyboard: true
          }
        });
      }
      return true;
    case "deletePayment":
      if (!query || !query.deletePayment || !query.deletePayment.paymentId)
        return true;
      let pmName = user.__(
        "paymethod" + query.deletePayment.paymentId + "_name"
      );
      console.log(
        "DELETING: " + user.id + ",  " + query.deletePayment.paymentId
      );

      await PaymentMethod.destroy({
        where: { userId: user.id, paymentId: query.deletePayment.paymentId }
      });
      await tBot.sendMessage(
        tUser.id,
        user.__("paymethod_deleted %s", pmName),
        {
          parse_mode: "Markdown",
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      );
      return true;
    case "editPayment":
      if (!query || !query.editPayment || !query.editPayment.paymentId)
        return true;
      let pmName1 = user.__(
        "paymethod" + query.editPayment.paymentId + "_name"
      );
      showAddPayment(pmName1, user, tUser);
      return true;
    case "myOrders":
      await tBot.sendMessage(tUser.id, "[TODO] Handle open orders", {});
      return true;
    case "sendMessage":
      if (!query || !query.sendMessage || !query.sendMessage.accountId)
        return true;
      await redisClient.hmsetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.currentContext,
        CONTEXT_SENDMESSAGE,
        cacheKeys.tContext["SendMessage.accountId"],
        query.sendMessage.accountId
      );
      redisClient.expireAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.expiry
      );
      let receiverUser: User | null = await User.findOne({
        where: { accountId: query.sendMessage.accountId }
      });
      let receiverBlockedUsers: number[] = receiverUser
        ? JSON.parse(receiverUser.blockedUsers)
        : [];
      let amIBlocked: boolean =
        receiverUser != null && receiverBlockedUsers.indexOf(user.id) > -1;
      if (amIBlocked) {
        await redisClient.delAsync(cacheKeys.tContext.key);
        tBot.sendMessage(tUser.id, user.__("send_message_not_allowed"), {
          parse_mode: "Markdown"
        });
      } else if (receiverUser) {
        let myBlockList: number[] = JSON.parse(user.blockedUsers);
        if (myBlockList.indexOf(receiverUser.id) > -1) {
          await redisClient.delAsync(cacheKeys.tContext.key);
          tBot.sendMessage(tUser.id, user.__("send_error_user_blocked"), {
            parse_mode: "Markdown"
          });
        } else {
          tBot.sendMessage(tUser.id, user.__("enter_send_message"), {
            parse_mode: "Markdown"
          });
        }
      } else {
        await redisClient.delAsync(cacheKeys.tContext.key);
        sendErrorMessage(user, tUser);
      }
      return true;
    case "blockAccount":
      if (!query || !query.blockAccount || !query.blockAccount.accountId)
        return true;
      let blockedUsers1: number[] = JSON.parse(user.blockedUsers);
      console.log(
        "BLOCK: " +
          query.blockAccount.shouldBlock +
          ", " +
          JSON.stringify(blockedUsers1) +
          " " +
          typeof query.blockAccount.shouldBlock
      );
      let b: User | null = await User.findOne({
        where: { accountId: query.blockAccount.accountId }
      });
      if (b) {
        console.log(
          ">>>> " +
            JSON.stringify(b) +
            ", " +
            !query.blockAccount.shouldBlock +
            ", " +
            (blockedUsers1.indexOf(b.id) > -1)
        );
        if (query.blockAccount.shouldBlock == 0 && blockedUsers1) {
          //to unblock
          console.log("unblocking...");
          blockedUsers1.splice(blockedUsers1.indexOf(b.id), 1);
        } else if (
          query.blockAccount.shouldBlock &&
          blockedUsers1.indexOf(b.id) <= -1
        ) {
          //to block
          console.log("blocking...");
          blockedUsers1.push(b.id);
        }
      } else {
        sendErrorMessage(user, tUser);
      }
      await User.update(
        { blockedUsers: JSON.stringify(blockedUsers1) },
        { where: { id: user.id } }
      );
      await new CacheStore(tUser.id).clearUserCache();
      msg.message_id = query.messageId;
      user.blockedUsers = JSON.stringify(blockedUsers1);
      showAccount(query.blockAccount.accountId, msg, user, tUser);
      return true;
    default:
      return false;
  }
};

let accountContext = async function(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramUser,
  context: string
): Promise<boolean> {
  let cacheKeys = new CacheStore(tUser.id).getKeys();
  await redisClient.hmsetAsync(
    cacheKeys.tContext.key,
    cacheKeys.tContext.currentContext,
    "",
    cacheKeys.tContext["SendMessage.accountId"],
    ""
  );
  if (context === CONTEXT_SENDMESSAGE) {
    let [sendAccount] = await redisClient.hmgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext["SendMessage.accountId"]
    );
    await redisClient.delAsync(cacheKeys.tContext.key);
    let sendUser: User | null = await User.findOne({
      where: { accountId: sendAccount.toLowerCase() },
      include: [TelegramUser]
    });
    if (sendUser && (msg.text || msg.photo)) {
      let replyMarkup = {
        inline_keyboard: [
          [
            {
              text: user.__("send_response_message"),
              callback_data: stringifyCallbackQuery(
                ICallbackFunction.SendMessage,
                null,
                { accountId: user.accountId }
              )
            }
          ]
        ]
      };
      if (msg.text) {
        await tBot.sendMessage(
          sendUser.telegramUser.id,
          user.__("new_message %s", "/u" + user.accountId.toUpperCase()) +
            "\n\n" +
            msg.text,
          {
            parse_mode: "Markdown",
            reply_markup: replyMarkup
          }
        );
      } else if (msg.photo) {
        await tBot.sendMessage(
          sendUser.telegramUser.id,
          user.__("new_message %s", "/u" + user.accountId.toUpperCase()),
          {
            parse_mode: "Markdown"
          }
        );
        await tBot.sendPhoto(sendUser.telegramUser.id, msg.photo[0].file_id, {
          reply_markup: replyMarkup
        });
      }
      await tBot.sendMessage(
        tUser.id,
        user.__(
          "message_send_success %s",
          "/u" + sendUser.accountId.toUpperCase()
        ),
        {}
      );
    } else {
      await tBot.sendMessage(tUser.id, user.__("message_send_failed"), {});
    }
    return true;
  } else if (context === CONTEXT_ADDPAYMETHOD) {
    showAddPayment(msg.text || "", user, tUser);
    return true;
  } else if (msg.text && context === CONTEXT_ENTERPAYMETHOD) {
    await redisClient.expireAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.expiry
    );
    let fields: string[] = JSON.parse(
      await redisClient.hgetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext["EnterPayMethod.fields"]
      )
    );
    let methodName = await redisClient.hgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext["EnterPayMethod.methodName"]
    );
    fields.push(msg.text);
    await redisClient.hmsetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.currentContext,
      CONTEXT_ENTERPAYMETHOD,
      cacheKeys.tContext["EnterPayMethod.fields"],
      JSON.stringify(fields)
    );

    let pmFields = await PaymentDetail.getLocaleFields(user, methodName);
    if (pmFields && fields.length < pmFields.length) {
      pmFields &&
        (await tBot.sendMessage(
          tUser.id,
          user.__("paymethod_enter_field %s", pmFields[fields.length]),
          {
            parse_mode: "Markdown",
            reply_markup: {
              keyboard: [[]]
            }
          }
        ));
    } else if (pmFields) {
      if (msg.text === user.__("confirm")) {
        redisClient.delAsync(cacheKeys.tContext.key);
        // TODO: SAVE payment method
        let paymentId = await PaymentDetail.getPaymethodID(user, methodName);
        let insert: any = {
          userId: user.id,
          paymentId: paymentId,
          field1: fields[0]
        };
        console.log("LENGTH: " + pmFields.length);
        if (pmFields.length >= 2) insert["field2"] = fields[1];
        if (pmFields.length >= 3) insert["field3"] = fields[2];
        if (pmFields.length >= 4) insert["field4"] = fields[3];

        await PaymentMethod.destroy({
          where: { userId: user.id, paymentId: paymentId }
        });
        let pm = new PaymentMethod(insert);
        await pm.save();

        pmFields &&
          (await tBot.sendMessage(
            tUser.id,
            user.__("paymethod_saved %s", methodName),
            {
              parse_mode: "Markdown",
              reply_markup: {
                keyboard: keyboardMenu(user),
                one_time_keyboard: false,
                resize_keyboard: true
              }
            }
          ));
      } else if (msg.text === user.__("cancel")) {
        await redisClient.delAsync(cacheKeys.tContext.key);
        tBot.sendMessage(tUser.id, user.__("context_action_cancelled"), {
          parse_mode: "Markdown",
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        });
      } else {
        let message: string = user.__("paymethod_add_confirm %s", methodName);
        for (let i = 0; i < pmFields.length; i++) {
          message =
            message +
            user.__("paymethod_field_show %s %s", pmFields[i], fields[i]);
        }
        pmFields &&
          (await tBot.sendMessage(tUser.id, message, {
            parse_mode: "Markdown",
            reply_markup: {
              keyboard: [
                [{ text: user.__("confirm") }],
                [{ text: user.__("cancel") }]
              ],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          }));
      }
    }
    return true;
  } else {
    return false;
  }
};

async function showAddPayment(
  paymethod: string,
  user: User,
  tUser: TelegramUser
) {
  let cacheKeys = new CacheStore(tUser.id).getKeys();
  if (
    paymethod &&
    (await PaymentDetail.isPaymethodNameExists(user, paymethod))
  ) {
    await redisClient.hmsetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.currentContext,
      CONTEXT_ENTERPAYMETHOD,
      cacheKeys.tContext["EnterPayMethod.methodName"],
      paymethod,
      cacheKeys.tContext["EnterPayMethod.fields"],
      "[]"
    );
    await redisClient.expireAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.expiry
    );
    let pmFields = await PaymentDetail.getLocaleFields(user, paymethod);
    pmFields &&
      (await tBot.sendMessage(
        tUser.id,
        user.__("paymethod_enter_heading %s %s", paymethod, pmFields[0]),
        {
          parse_mode: "Markdown",
          reply_markup: {
            keyboard: [[{ text: user.__("cancel_text") }]],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      ));
  } else {
    await redisClient.delAsync(cacheKeys.tContext.key);
    await tBot.sendMessage(tUser.id, "Invalid input. Please try again.", {});
  }
}

async function showMyAccount(
  msg: TelegramBot.Message,
  user: User,
  _tUser: TelegramUser
) {
  let addPaymentInline,
    pmNames = await PaymentDetail.getPaymethodNames(user, true);
  if (pmNames.length === 0) {
    addPaymentInline = {
      text: user.__("add_payment_method"),
      callback_data: stringifyCallbackQuery(
        ICallbackFunction.AddPayment,
        null,
        null
      )
    };
  } else {
    addPaymentInline = {
      text: user.__("show_payment_methods"),
      callback_data: stringifyCallbackQuery(
        ICallbackFunction.ShowPayments,
        null,
        null
      )
    };
  }
  let inlineSettings = {
    text: user.__("menu_settings"),
    callback_data: stringifyCallbackQuery(
      ICallbackFunction.Settings,
      null,
      null
    )
  };
  let secondInline = !user.isVerified
    ? [
        { text: user.__("verify_account"), url: "http://google.com" },
        inlineSettings
      ]
    : [inlineSettings];

  let pmethodMessage = pmNames.length > 0 ? "" : user.__("not_added");
  for (let i = 0; i < pmNames.length; i++) {
    if (i === pmNames.length - 1) pmethodMessage = pmethodMessage + pmNames[i];
    else pmethodMessage = pmethodMessage + " " + pmNames[i] + ",";
  }
  let verificationMessage = user.isVerified
    ? user.__("account_verified")
    : user.__("account_not_verified");
  await tBot.sendMessage(
    msg.chat.id,
    user.__(
      "show_my_account %s %d %f %f %d %d %d %d %d %s",
      "/u" + user.accountId.toUpperCase(),
      1,
      0.0001,
      4.8,
      4,
      1,
      2,
      100,
      1,
      verificationMessage,
      pmethodMessage
    ),
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[addPaymentInline], secondInline],
        one_time_keyboard: false,
        resize_keyboard: true
      }
    }
  );
}

async function showAccount(
  accountId: string,
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramUser
) {
  console.log(
    "ACCOUNT: " +
      accountId +
      ", " +
      JSON.stringify(msg) +
      ", " +
      JSON.stringify(user)
  );
  if (!msg.text || !msg.entities) return;
  let cacheKeys = new CacheStore(tUser.id).getKeys();
  await redisClient.hmsetAsync(
    cacheKeys.tContext.key,
    cacheKeys.tContext.currentContext,
    ""
  );
  let showUser: User | null = await User.findOne({
    where: { accountId: accountId }
  });
  if (showUser) {
    let blockedUsers: number[] = JSON.parse(user.blockedUsers);
    let isUserBlocked = blockedUsers.indexOf(showUser.id) > -1;
    let blockUnblockMessage = isUserBlocked
      ? user.__("unblock_account")
      : user.__("block_account");

    let inlineMessageId =
      msg && msg.from && msg.from.is_bot
        ? msg.message_id
        : msg
          ? msg.message_id + 1
          : null;
    let inlineKeyboard: TelegramBot.InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: blockUnblockMessage,
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.BlockAccount,
              inlineMessageId,
              { accountId: accountId, shouldBlock: isUserBlocked ? 0 : 1 }
            )
          },
          {
            text: user.__("send_message"),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.SendMessage,
              null,
              { accountId: accountId }
            )
          }
        ],
        [
          {
            text: user.__("open_orders %d", 1),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.MyOrders,
              null,
              { accountId: accountId }
            )
          }
        ]
      ]
    };

    let verificationMessage = showUser.isVerified
      ? showUser.__("account_verified")
      : showUser.__("account_not_verified");
    let lastActive = moment().diff(showUser.updatedAt, "m");
    let message: string = user.__(
      "show_other_account %s %d %f %f %d %d %s %d %s %d",
      "/u" + accountId.toUpperCase(),
      1,
      0.0001,
      4.8,
      4,
      1,
      verificationMessage,
      "10",
      "PayTM, UPI, IMPS",
      lastActive
    );
    if (isUserBlocked) message = message + user.__("account_block_info");
    if (accountId.toLowerCase() === user.accountId) {
      message = message + user.__("my_account_info");
    }
    if (msg && msg.from && msg.from.is_bot) {
      //callback query
      await tBot.editMessageText(message, {
        parse_mode: "Markdown",
        chat_id: tUser.id,
        message_id: msg.message_id,
        reply_markup: inlineKeyboard,
        disable_web_page_preview: true
      });
    } else if (msg) {
      await tBot.sendMessage(msg.chat.id, message, {
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard
      });
    }
  } else {
    //account not found
    await tBot.sendMessage(
      msg.chat.id,
      user.__("account_not_available %s", accountId.toUpperCase()),
      {
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      }
    );
  }
}

async function handleReferrals(
  msg: TelegramBot.Message,
  user: User,
  _tUser: TelegramUser
) {
  await tBot.sendMessage(msg.chat.id, "[TODO] HANDLE REFERRALS ", {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: keyboardMenu(user),
      one_time_keyboard: false,
      resize_keyboard: true
    }
  });
}

export { accountConversation, accountCallback, accountContext };
