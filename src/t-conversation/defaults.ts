import User from "../models/user";
import TelegramUser from "../models/telegram_user";
import TelegramBotApi from "../helpers/telegram-bot-api";
import Market from "../models/market";
import * as TelegramBot from "node-telegram-bot-api";

enum ICallbackFunction {
  CoinSend = "coinSend",
  CoinAddress = "coinAddress",
  CoinWithdraw = "coinWithdraw",
  Paginate = "paginate",
  GoBack = "goBack",
  NewAddress = "newAddress",
  QRCode = "qrCode",
  AccountLink = "accountLink",
  ReferralLink = "referralLink",
  StarterGuide = "starterGuide",
  AddPayment = "addPayment",
  DeletePayment = "deletePayment",
  ShowPayments = "showPayments",
  EditPayment = "editPayment",
  MyOrders = "myOrders",
  CreateOrder = "createOrder",
  SendMessage = "sendMessage",
  BlockAccount = "blockAccount",
  UseMarketRate = "useMarketRate",
  OrderEditRate = "orderEditRate",
  OrderEditAmount = "orderEditAmount",
  OrderEditTerms = "orderEditTerms",
  OrderSetActive = "orderSetActive",
  Settings = "settings",
  Buy = "buy",
  Sell = "sell"
}

interface ICallbackQuery {
  callbackFunction: ICallbackFunction;
  messageId: number;
  coinSend?: {
    coin: string;
  };
  coinAddress?: {
    coin: string;
  };
  coinWithdraw?: {
    coin: string;
  };
  qrCode?: {
    coin: string;
    address: string;
  };
  back?: {
    coin: string;
  };
  paginate?: {
    action: "next" | "prev" | "refresh";
    currentPage: number;
  };
  goBack?: {};
  myOrders?: {
    accountId: string;
  };
  sendMessage?: {
    accountId: string;
  };
  addPayment?: {
    paymentId: number;
  };
  deletePayment?: {
    paymentId: number;
  };
  editPayment?: {
    paymentId: number;
  };
  showPayments?: {
    paymentId: number;
  };
  blockAccount?: {
    accountId: string;
    shouldBlock: number;
  };
  newAddress?: {};
  accountLink?: {};
  referralLink?: {};
  starterGuide?: {};
  settings?: {};
  orderEditRate?: {
    orderId: number;
  };
  orderEditAmount?: {
    orderId: number;
  };
  orderEditTerms?: {
    orderId: number;
  };
  orderSetActive?: {
    orderId: number;
    active: boolean;
  };
  useMarketRate?: {
    type: "buy" | "sell";
  };
  buy?: {};
  sell?: {};
  createOrder?: {};
}

let tBot = new TelegramBotApi().getBot();
let keyboardMenu = (user: User) => {
  return [
    [{ text: user.__("menu_wallet") }, { text: user.__("menu_buy_sell") }],
    [{ text: user.__("menu_my_account") }, { text: user.__("menu_info") }]
  ];
};

let sendErrorMessage = async function(user: User, tUser: TelegramUser) {
  tBot.sendMessage(tUser.id, user.__("error_unknown"), {
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: keyboardMenu(user),
      one_time_keyboard: false,
      resize_keyboard: true
    }
  });
};

let toTitleCase = function(s: string) {
  return s.replace(/\b\w/g, l => l.toUpperCase());
};

let stringifyCallbackQuery = function(
  callbackFunction: ICallbackQuery["callbackFunction"],
  messageId: number | null,
  values: null | ICallbackQuery[ICallbackFunction]
) {
  let q = callbackFunction + ":";
  if (messageId) q = q + "messageId=" + messageId + ",";
  let t: any = values ? values : {};
  Object.keys(t).forEach(function(key) {
    q = q + key + "=" + t[key] + ",";
  });
  return q.substring(0, q.length - 1);
};

let parseCallbackQuery = function(query: string): ICallbackQuery {
  let callbackFunction, obj, pairs: string[], tKey, tVal;
  [callbackFunction, obj] = query.split(":");
  let res: any = { callbackFunction };
  res[callbackFunction] = {};
  pairs = obj ? obj.split(",") : [];
  for (let i = 0; i < pairs.length; i++) {
    if (pairs.length > 0) {
      [tKey, tVal] = pairs[i].split("=");
      if (tKey === "messageId") res[tKey] = tVal;
      else res[callbackFunction][tKey] = tVal;
    }
  }
  return res;
};

let isBotCommand = function(msg: TelegramBot.Message) {
  return msg.text && msg.entities && msg.entities[0].type === "bot_command";
};

let centerJustify = function(str: string | number, length: number) {
  let char = " ";
  str = str + "";
  return (
    char.repeat((length - str.length) / 2) +
    str +
    char.repeat((length - str.length) / 2)
  );
};

let parseRange = async function(str: string) {
  let maxAmount: number | null;
  let minAmount: number = 0;
  if (str.indexOf("-") > -1) {
    let t = str.split("-");
    let tCur1 = t[0].replace(/[^a-z]/g, "").toLowerCase();
    let tCur2 = t[1].replace(/[^a-z]/g, "").toLowerCase();
    if (tCur1.length === 0) t[0] = t[0] + tCur2;
    minAmount = (await Market.parseCurrencyValue(t[0], "inr")) || 0;
    maxAmount = await Market.parseCurrencyValue(t[1], "inr");
  } else {
    maxAmount = await Market.parseCurrencyValue(str, "inr");
  }

  return [minAmount, maxAmount];
};

export {
  keyboardMenu,
  sendErrorMessage,
  toTitleCase,
  stringifyCallbackQuery,
  parseCallbackQuery,
  isBotCommand,
  centerJustify,
  parseRange,
  ICallbackFunction,
  ICallbackQuery
};
