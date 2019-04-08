// import * as TelegramBot from 'node-telegram-bot-api'
// import { TelegramAccount, User } from '../models'
// import telegramHook from '../modules/TelegramHook'
// import {
//   ICallbackQuery,
//   ICallbackFunction,
//   stringifyCallbackQuery
// } from './defaults'

// const tBot = telegramHook.getBot
// const infoConversation = async function(
//   msg: TelegramBot.Message | null,
//   user: User,
//   _tUser: TelegramAccount
// ): Promise<boolean> {
//   if (!(msg && msg.text === user.__('menu_info'))) {
//     return false
//   }
//   tBot.sendMessage(msg.chat.id, user.__('info_message'), {
//     parse_mode: 'Markdown',
//     reply_markup: {
//       inline_keyboard: [
//         [
//           { text: user.__('contact_support'), url: user.__('support_link') },
//           { text: user.__('join_group'), url: user.__('group_link') }
//         ],
//         [
//           {
//             text: user.__('referral_link'),
//             callback_data: stringifyCallbackQuery(
//               ICallbackFunction.ReferralLink,
//               null,
//               null
//             )
//           }
//         ],
//         [
//           {
//             text: user.__('starter_guide'),
//             callback_data: stringifyCallbackQuery(
//               ICallbackFunction.StarterGuide,
//               null,
//               null
//             )
//           }
//         ]
//       ],
//       one_time_keyboard: false,
//       resize_keyboard: true
//     }
//   })
//   return true
// }

// const infoCallback = async function(
//   _msg: TelegramBot.Message,
//   _user: User,
//   _tUser: TelegramAccount,
//   _query: ICallbackQuery
// ): Promise<boolean> {
//   return false
// }

// const infoContext = async function(
//   _msg: TelegramBot.Message,
//   _user: User,
//   _tUser: TelegramAccount,
//   _context: string
// ): Promise<boolean> {
//   return false
// }

// export { infoConversation, infoCallback, infoContext }
