import * as TelegramBot from "node-telegram-bot-api";
import TelegramUser from "../models/telegram_user";
import User from "../models/user";
import Store from "../helpers/store";
import PaymentMethods from "../models/payment_method";
import Market from "../models/market";
import Logger from "../helpers/logger";
import TelegramBotApi from "../helpers/telegram-bot-api";
import {
  stringifyCallbackQuery,
  ICallbackFunction,
  ICallbackQuery,
  keyboardMenu,
  parseRange
} from "./defaults";
import CacheStore from "../cache-keys";
import * as AppConfig from "../../config/app.json";
import Wallet from "../models/wallet";
import Order from "../models/order";
import PaymentDetail from "../models/payment_detail";
let env = process.env.NODE_ENV || "development";

let logger = new Logger().getLogger();
let tBot = new TelegramBotApi().getBot();
let redisClient = new Store().getClient();

let CONTEXT_TRADE_BUY = "TRADE_BUY";
let CONTEXT_TRADE_SELL = "TRADE_SELL";
let CONTEXT_TRADE_EDIT_AMOUNT = "TRADE_EDIT_AMOUNT";
let CONTEXT_TRADE_EDIT_RATE = "TRADE_EDIT_RATE";
let CONTEXT_TRADE_EDIT_TERMS = "TRADE_EDIT_TERMS";

let tradeConversation = async function(
  msg: TelegramBot.Message | null,
  user: User,
  tUser: TelegramUser
): Promise<boolean> {
  let cacheKeys = new CacheStore(tUser.id).getKeys();
  if (msg && msg.text === user.__("menu_buy_sell")) {
    let rate = await Market.getValue("btc", user.currencyCode);
    let localizedRate = "N/A",
      hasOpenOrders = true;

    if (rate)
      localizedRate = rate.toLocaleString(tUser.languageCode, {
        style: "currency",
        currency: user.currencyCode
      });
    let replyMarkup: TelegramBot.InlineKeyboardButton[][] = [];
    if (hasOpenOrders)
      replyMarkup.push([
        {
          text: user.__("open_orders %d", 0),
          callback_data: stringifyCallbackQuery(
            ICallbackFunction.MyOrders,
            null,
            null
          )
        },
        {
          text: user.__("create_order"),
          callback_data: stringifyCallbackQuery(
            ICallbackFunction.CreateOrder,
            null,
            null
          )
        }
      ]);
    else
      replyMarkup.push([
        {
          text: user.__("create_order"),
          callback_data: stringifyCallbackQuery(
            ICallbackFunction.CreateOrder,
            null,
            null
          )
        }
      ]);

    replyMarkup.push([
      {
        text: user.__("buy_button"),
        callback_data: stringifyCallbackQuery(ICallbackFunction.Buy, null, null)
      }
    ]);
    replyMarkup.push([
      {
        text: user.__("sell_button"),
        callback_data: stringifyCallbackQuery(
          ICallbackFunction.Sell,
          null,
          null
        )
      }
    ]);

    tBot.sendMessage(
      msg.chat.id,
      user.__(
        "buy_sell_message %s %s %s",
        (<any>AppConfig)[env]["telegram_support_username"],
        user.currencyCode.toUpperCase(),
        localizedRate
      ),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: replyMarkup
        }
      }
    );

    return true;
  } else if (msg && msg.text === user.__("sell_btc_order_create")) {
    await redisClient.delAsync(cacheKeys.tContext.key);
    await redisClient.hmsetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.currentContext,
      CONTEXT_TRADE_SELL
    );
    let pm = await PaymentMethods.findOne({ where: { userId: user.id } });
    if (pm) {
      let wallet: Wallet | null = await Wallet.find({
        where: { userId: user.id, currencyCode: "btc" }
      });

      if (wallet) {
        await tBot.sendMessage(
          tUser.id,
          user.__(
            "sell_btc_enter_amount %s %f",
            user.currencyCode.toUpperCase(),
            wallet.availableBalance.toFixed(6).replace(/\.?0*$/, "")
          ),
          {
            parse_mode: "Markdown",
            reply_markup: {
              keyboard: keyboardMenu(user),
              one_time_keyboard: false,
              resize_keyboard: true
            }
          }
        );
        redisClient.expireAsync(
          cacheKeys.tContext.key,
          cacheKeys.tContext.expiry
        );
      }
    } else {
      await tBot.sendMessage(tUser.id, user.__("no_payment_methods"), {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.__("add_payment_method"),
                callback_data: stringifyCallbackQuery(
                  ICallbackFunction.AddPayment,
                  null,
                  null
                )
              }
            ]
          ]
        }
      });
    }

    return true;
  } else if (msg && msg.text === user.__("buy_btc_order_create")) {
    await redisClient.delAsync(cacheKeys.tContext.key);
    await redisClient.hmsetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.currentContext,
      CONTEXT_TRADE_BUY,
      cacheKeys.tContext["Trade.isParsePaymethod"],
      1
    );
    redisClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry);

    // Choose required payment method:
    let payNames: string[] = await PaymentDetail.getPaymethodNames(user);
    let keyboard: TelegramBot.KeyboardButton[][] = [];
    for (let i = 0; i < payNames.length; i++) {
      keyboard.push([{ text: payNames[i] }]);
    }
    await tBot.sendMessage(msg.chat.id, user.__("buy_btc_select_paymethod"), {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: keyboard,
        one_time_keyboard: false,
        resize_keyboard: true
      }
    });

    return true;
  } else if (msg && msg.text && msg.text.startsWith("/o")) {
    await tBot.sendMessage(msg.chat.id, "TODO: Handlde show order");

    return true;
  }

  return false;
};

let tradeCallback = async function(
  _msg: TelegramBot.Message,
  user: User,
  tUser: TelegramUser,
  query: ICallbackQuery
): Promise<boolean> {
  let cacheKeys = new CacheStore(tUser.id).getKeys();
  switch (query.callbackFunction) {
    case ICallbackFunction.Buy:
      tBot.sendMessage(tUser.id, `[TODO] Show buy orders list`);
      return true;

    case ICallbackFunction.Sell:
      tBot.sendMessage(tUser.id, `[TODO] Show sell orders list`);
      return true;

    case ICallbackFunction.CreateOrder:
      await redisClient.delAsync(cacheKeys.tContext.key);
      redisClient.expireAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.expiry
      );
      await tBot.sendMessage(tUser.id, user.__("create_order_message"), {
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: [
            [{ text: user.__("buy_btc_order_create") }],
            [{ text: user.__("sell_btc_order_create") }],
            [{ text: user.__("cancel_text") }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
      return true;

    case ICallbackFunction.MyOrders:
      tBot.sendMessage(tUser.id, `[TODO] Show my orders list`);
      return true;

    case ICallbackFunction.UseMarketRate:
      if (query.useMarketRate) {
        let price = await Market.getValue("btc", user.currencyCode);
        if (query.useMarketRate.type === "buy" && price) {
          handleOrderCreateInputPrice(price, "market", "buy", user, tUser);
        } else if (query.useMarketRate.type === "sell" && price) {
          handleOrderCreateInputPrice(price, "market", "buy", user, tUser);
        }
      }
      return true;

    case ICallbackFunction.OrderEditAmount:
      if (query.orderEditAmount && query.orderEditAmount.orderId)
        await redisClient.hmsetAsync(
          cacheKeys.tContext.key,
          cacheKeys.tContext.currentContext,
          CONTEXT_TRADE_EDIT_AMOUNT,
          cacheKeys.tContext["Trade.editOrderId"],
          query.orderEditAmount.orderId
        );
      await tBot.sendMessage(tUser.id, user.__("btc_edit_amount"), {
        parse_mode: "Markdown"
      });
      redisClient.expireAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.expiry
      );
      return true;

    case ICallbackFunction.OrderEditRate:
      if (query.orderEditRate && query.orderEditRate.orderId)
        await redisClient.hmsetAsync(
          cacheKeys.tContext.key,
          cacheKeys.tContext.currentContext,
          CONTEXT_TRADE_EDIT_RATE,
          cacheKeys.tContext["Trade.editOrderId"],
          query.orderEditRate.orderId
        );
      await tBot.sendMessage(
        tUser.id,
        user.__(
          "btc_edit_rate %s %s %s",
          await Market.getValue("btc", user.currencyCode),
          user.currencyCode.toUpperCase(),
          "2%"
        ),
        {
          parse_mode: "Markdown"
        }
      );
      redisClient.expireAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.expiry
      );
      return true;

    case ICallbackFunction.OrderEditTerms:
      if (query.orderEditTerms && query.orderEditTerms.orderId)
        await redisClient.hmsetAsync(
          cacheKeys.tContext.key,
          cacheKeys.tContext.currentContext,
          CONTEXT_TRADE_EDIT_TERMS,
          cacheKeys.tContext["Trade.editOrderId"],
          query.orderEditTerms.orderId
        );
      await tBot.sendMessage(tUser.id, user.__("btc_edit_terms"), {
        parse_mode: "Markdown"
      });
      redisClient.expireAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.expiry
      );
      return true;

    case ICallbackFunction.OrderSetActive:
      await tBot.sendMessage(tUser.id, "[TODO] HANDLE SET ACTIVE");
      return true;
  }
  return false;
};

let tradeContext = async function(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramUser,
  context: string
): Promise<boolean> {
  let cacheKeys = new CacheStore(tUser.id).getKeys();
  let [isInputPrice] = await redisClient.hmgetAsync(
    cacheKeys.tContext.key,
    cacheKeys.tContext["Trade.isInputPrice"]
  );

  if (context === CONTEXT_TRADE_BUY && msg.text) {
    let [isParsePaymethod] = await redisClient.hmgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext["Trade.isParsePaymethod"]
    );
    if (isInputPrice) {
      handleOrderCreateInputPrice(
        parseInt(msg.text),
        "fixed",
        "buy",
        user,
        tUser
      );
    } else if (isParsePaymethod) {
      await redisClient.hdelAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext["Trade.isParsePaymethod"]
      );
      let paymethodId = await PaymentDetail.getPaymethodID(user, msg.text);
      if (msg.text && paymethodId >= 0) {
        await tBot.sendMessage(
          msg.chat.id,
          user.__("buy_btc_enter_amount %s", user.currencyCode.toUpperCase()),
          {
            parse_mode: "Markdown",
            reply_markup: {
              keyboard: [[{ text: user.__("cancel_text") }]],
              one_time_keyboard: false,
              resize_keyboard: true
            }
          }
        );
      } else {
        await redisClient.delAsync(cacheKeys.tContext.key);
        await tBot.sendMessage(
          msg.chat.id,
          user.__("invalid_input", user.currencyCode),
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
    } else {
      handleOrderCreate(msg.text, user, tUser, "buy");
    }
    return true;
  } else if (context === CONTEXT_TRADE_SELL && msg.text) {
    if (isInputPrice) {
      handleOrderCreateInputPrice(
        parseInt(msg.text),
        "fixed",
        "buy",
        user,
        tUser
      );
    } else {
      handleOrderCreate(msg.text, user, tUser, "sell");
    }
    return true;
  } else if (context === CONTEXT_TRADE_EDIT_AMOUNT && msg.text) {
    let [minAmount, maxAmount] = await parseRange(msg.text);
    if (!maxAmount) {
      tBot.sendMessage(
        tUser.id,
        user.__("buy_invalid_amount %s", user.currencyCode.toUpperCase()),
        { parse_mode: "markdown" }
      );
    } else {
      const [orderId] = await redisClient.hmgetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext["Trade.editOrderId"]
      );
      redisClient.delAsync(cacheKeys.tContext.key);
      let [updatedRows] = await Order.update(
        { maxAmount, minAmount },
        { where: { id: orderId } }
      );
      if (updatedRows === 1) {
        let order = await Order.findOne({ where: { id: orderId } });
        await tBot.sendMessage(tUser.id, user.__("order_updated"), {
          parse_mode: "markdown"
        });
        if (order) {
          showOrder(user, tUser, order, msg.message_id + 1, false);
        } else {
          logger.error("Error Trade: 247");
        }
      }
    }

    return true;
  } else if (context === CONTEXT_TRADE_EDIT_RATE && msg.text) {
    const [orderId] = await redisClient.hmgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext["Trade.editOrderId"]
    );
    let updatedRows = -1;
    if (msg.text.indexOf("%") > -1) {
      let margin = parseFloat(msg.text);
      if (margin >= 0) {
        [updatedRows] = await Order.update(
          { marginPercentage: margin, price: null },
          { where: { id: orderId } }
        );
        redisClient.delAsync(cacheKeys.tContext.key);
      } else {
        await tBot.sendMessage(tUser.id, user.__("invalid_input"), {
          parse_mode: "markdown"
        });
      }
    } else {
      let rate = parseInt(msg.text);
      if (rate >= 0) {
        [updatedRows] = await Order.update(
          { price: rate },
          { where: { id: orderId } }
        );
        redisClient.delAsync(cacheKeys.tContext.key);
      } else {
        await tBot.sendMessage(tUser.id, user.__("invalid_input"), {
          parse_mode: "markdown"
        });
      }
      redisClient.delAsync(cacheKeys.tContext.key);
    }
    if (updatedRows === 1) {
      let order = await Order.findOne({ where: { id: orderId } });
      await tBot.sendMessage(tUser.id, user.__("order_updated"), {
        parse_mode: "markdown"
      });
      if (order) {
        showOrder(user, tUser, order, msg.message_id + 1, false);
      } else {
        logger.error("Error Trade: 247");
      }
    }
    return true;
  } else if (context === CONTEXT_TRADE_EDIT_TERMS && msg.text) {
  }
  return false;
};

async function handleOrderCreate(
  msg: string,
  user: User,
  tUser: TelegramUser,
  type: "buy" | "sell"
) {
  if (!msg) return;
  let cacheKeys = new CacheStore(tUser.id).getKeys();

  if (type === "buy") {
    let [minAmount, maxAmount] = await parseRange(msg);

    if (!maxAmount) {
      // invalid amount entered
      tBot.sendMessage(
        tUser.id,
        user.__("buy_invalid_amount %s", user.currencyCode.toUpperCase()),
        { parse_mode: "markdown" }
      );
    } else {
      await redisClient.hmsetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext["Trade.maxAmount"],
        maxAmount,
        cacheKeys.tContext["Trade.minAmount"],
        minAmount,
        cacheKeys.tContext["Trade.isInputPrice"],
        1
      );

      tBot.sendMessage(
        tUser.id,
        user.__("buy_btc_enter_price %s", user.currencyCode.toUpperCase(), {
          parse_mode: "markdown"
        }),
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.__(
                    "use_market_rate %d %s",
                    await Market.getValue("btc", user.currencyCode),
                    user.currencyCode.toUpperCase()
                  ),
                  callback_data: stringifyCallbackQuery(
                    ICallbackFunction.UseMarketRate,
                    null,
                    { type: "buy" }
                  )
                }
              ]
            ]
          }
        }
      );
    }
  } else if (type === "sell") {
    let maxAmount: number | null = null,
      minAmount: number | null = 0;
    [minAmount, maxAmount] = await parseRange(msg);
    if (!maxAmount) {
      // invalid amount entered
      tBot.sendMessage(
        tUser.id,
        user.__("sell_invalid_amount %s", user.currencyCode.toUpperCase()),
        {
          parse_mode: "Markdown"
        }
      );
    } else {
      let wallet: Wallet | null = await Wallet.find({
        where: { userId: user.id, currencyCode: "btc" }
      });
      if (wallet) {
        if (maxAmount > wallet.availableBalance) {
          //insufficient funds for sell order
          redisClient.delAsync(cacheKeys.tContext.key);

          tBot.sendMessage(
            tUser.id,
            user.__(
              "sell_isufficient_balance %f %s",
              wallet.availableBalance,
              wallet.address
            ),
            {
              parse_mode: "Markdown",
              reply_markup: {
                keyboard: keyboardMenu(user)
              }
            }
          );
        } else {
          await redisClient.hmsetAsync(
            cacheKeys.tContext.key,
            cacheKeys.tContext["Trade.minAmount"],
            minAmount,
            cacheKeys.tContext["Trade.maxAmount"],
            maxAmount,
            cacheKeys.tContext["Trade.isInputPrice"],
            1
          );
          tBot.sendMessage(
            tUser.id,
            user.__("sell_btc_enter_price %s", user.currencyCode.toUpperCase()),
            {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: user.__(
                        "use_market_rate %d %s",
                        await Market.getValue("btc", user.currencyCode),
                        user.currencyCode.toUpperCase()
                      ),
                      callback_data: stringifyCallbackQuery(
                        ICallbackFunction.UseMarketRate,
                        null,
                        { type: "sell" }
                      )
                    }
                  ]
                ]
              }
            }
          );
        }
      }
    }
  }
}

async function handleOrderCreateInputPrice(
  fiatPrice: number,
  priceType: "market" | "fixed",
  orderType: "buy" | "sell",
  user: User,
  tUser: TelegramUser
) {
  let cacheKeys = new CacheStore(tUser.id).getKeys();
  if (fiatPrice && fiatPrice !== NaN && fiatPrice > 0) {
    const [maxAmount, minAmount] = await redisClient.hmgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext["Trade.maxAmount"],
      cacheKeys.tContext["Trade.minAmount"]
    );
    redisClient.delAsync(cacheKeys.tContext.key);
    if (orderType === "buy") {
      let order = new Order();
      let price = priceType === "market" ? null : fiatPrice;
      try {
        order = await order.createBuyOrder(
          user.id,
          minAmount,
          maxAmount,
          price,
          "btc"
        );
        if (order) {
          let m1 = await tBot.sendMessage(
            tUser.id,
            `[TODO PLACE buy ORDER]: amount ${minAmount} - ${maxAmount}, price: ${fiatPrice} priceType: ${priceType}`
          );
          if (m1 instanceof Error) {
            tBot.sendMessage(tUser.id, user.__("error_unknown"));
          } else {
            await showOrder(user, tUser, order, m1.message_id + 1, false);
          }
        }
      } catch (e) {
        logger.error(JSON.stringify(e));
        tBot.sendMessage(tUser.id, user.__("error_unknown"));
      }
    } else if (orderType === "sell") {
      tBot.sendMessage(
        tUser.id,
        `[TODO PLACE sell ORDER]: amount ${minAmount} - ${maxAmount}, price: ${fiatPrice} priceType: ${priceType}`
      );
    }
  } else {
    // invalid price entered
    if (orderType === "buy")
      tBot.sendMessage(
        tUser.id,
        user.__("buy_invalid_price %s", user.currencyCode.toUpperCase()),
        { parse_mode: "Markdown" }
      );
    else
      tBot.sendMessage(
        tUser.id,
        user.__("sell_invalid_price %s", user.currencyCode.toUpperCase()),
        { parse_mode: "Markdown" }
      );
  }
}

async function showOrder(
  user: User,
  tUser: TelegramUser,
  order: Order,
  thisMessageId: number,
  shouldEdit: boolean = false
) {
  let inlineKeyboard: TelegramBot.InlineKeyboardMarkup = {
    inline_keyboard: []
  };
  let message = "";

  if (order.type === "buy") {
    let amountText: string = order.minAmount
      ? order.minAmount + " - " + order.maxAmount
      : order.maxAmount + " BTC";
    let marketPrice: number | null = await Market.getValue(
      "btc",
      user.currencyCode
    );
    let marginPrice: number | null = marketPrice;
    if (marketPrice) {
      marginPrice = marketPrice + (marketPrice * order.marginPercentage) / 100;
    }
    let priceText: string = order.price
      ? order.price + " " + user.currencyCode.toUpperCase()
      : marginPrice + " " + user.currencyCode.toUpperCase();
    inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: user.__("order_inline_amount"),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.OrderEditAmount,
              null,
              { orderId: order.id }
            )
          },
          {
            text: user.__("order_inline_rate"),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.OrderEditRate,
              null,
              { orderId: order.id }
            )
          },
          {
            text: user.__("order_inline_terms"),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.OrderEditTerms,
              null,
              { orderId: order.id }
            )
          }
        ],
        [
          {
            text: user.__("inline_back"),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.GoBack,
              thisMessageId,
              null
            )
          },
          {
            text:
              order.status === "stopped"
                ? user.__("order_inline_turnon")
                : user.__("order_inline_turnoff"),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.OrderSetActive,
              null,
              { active: order.status === "stopped", orderId: order.id }
            )
          }
        ]
      ]
    };
    if (order.price) {
      message = user.__(
        "show_buy_order_fixed %s %s %s %s %s %s",
        "/o" + order.id,
        amountText,
        priceText,
        order.paymentMethodFilters,
        user.__("order_status_" + order.status),
        "https://t.me/" +
          (<any>AppConfig)[env]["telegram_bot_username"] +
          "/start=order-" +
          order.id
      );
    } else {
      message = user.__(
        "show_buy_order_margin %s %s %s %s %s %f %s %s %s %s",
        "/o" + order.id,
        amountText,
        priceText,
        marketPrice,
        order.marginPercentage >= 0 ? "+" : "-",
        order.marginPercentage,
        order.paymentMethodFilters,
        user.__("order_status_" + order.status),
        "https://t.me/" +
          (<any>AppConfig)[env]["telegram_bot_username"] +
          "/start=order-" +
          order.id,
        "%"
      );
    }
  } else if (order.type === "sell") {
  }

  if (shouldEdit) {
    await tBot.editMessageText(message, {
      parse_mode: "Markdown",
      chat_id: tUser.id,
      message_id: thisMessageId,
      reply_markup: inlineKeyboard,
      disable_web_page_preview: true
    });
  } else {
    await tBot.sendMessage(tUser.id, message, {
      parse_mode: "Markdown",
      reply_markup: inlineKeyboard
    });
  }
}

export { tradeConversation, tradeCallback, tradeContext };
