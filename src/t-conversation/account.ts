import * as TelegramBot from 'node-telegram-bot-api'
import CacheStore from '../cache-keys'
import { PaymentMethod, PaymentDetail, User, TelegramAccount } from '../models'
import telegramHook from '../modules/telegram-hook'
import cacheConnection from '../modules/cache'
import * as moment from 'moment'

import {
  stringifyCallbackQuery,
  keyboardMenu,
  sendErrorMessage,
  ICallbackQuery,
  ICallbackFunction
} from './defaults'
import { CONFIG } from '../config'

const CONTEXT_SENDMESSAGE = 'CONTEXT_SENDMESSAGE'
const CONTEXT_ADDPAYMETHOD = 'CONTEXT_ADDPAYMETHOD'
const CONTEXT_ENTERPAYMETHOD = 'CONTEXT_ENTERPAYMETHOD'
// let ENTER_PAYMETHOD_EXPIRY = 30

const tBot = telegramHook.getBot()
const accountConversation = async function(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount
): Promise<boolean> {
  if (msg.text && msg.text.startsWith('/u') && msg.entities) {
    const accountId = msg.text
      .substring(msg.entities[0].offset + 2, msg.entities[0].length)
      .toLowerCase()
    showAccount(accountId, msg, user, tUser)
    return true
  } else if (msg.text && msg.text === user.__('menu_my_account')) {
    showMyAccount(msg, user, tUser)
    return true
  } else if (msg.text && msg.text.startsWith('/start')) {
    const query = msg.text.replace('/start', '').replace(' ', '')
    const [func, param] = query.split('-')
    if (func === 'ref') {
      // handle referrals
      handleReferrals(msg, user, tUser)
      return true
    } else if (func === 'acc') {
      // handle account
      showAccount(param, msg, user, tUser)
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

const accountCallback = async function(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  query: ICallbackQuery
): Promise<boolean> {
  const cacheClient = await cacheConnection.getCacheClient()
  const botUsername = CONFIG.BOT_USERNAME
  const cacheKeys = new CacheStore(tUser.id).getKeys()
  switch (query.callbackFunction) {
    case 'accountLink':
      await tBot.sendMessage(msg.chat.id, user.__('show_account_link_info'), {
        parse_mode: 'Markdown'
      })
      await tBot.sendMessage(
        tUser.id,
        'https://t.me/' +
          botUsername +
          '?start=acc-' +
          user.accountId.toLowerCase(),
        {}
      )
      return true
    case 'referralLink':
      await tBot.sendMessage(msg.chat.id, user.__('show_referral_link_info'), {
        parse_mode: 'Markdown'
      })
      await tBot.sendMessage(
        tUser.id,
        'https://t.me/' +
          botUsername +
          '?start=ref-' +
          user.accountId.toLowerCase(),
        {
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true
    case 'addPayment':
      await cacheClient.hmsetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.currentContext,
        CONTEXT_ADDPAYMETHOD
      )
      cacheClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry)
      const payNames: string[] = await PaymentDetail.getPaymethodNames(user)
      const keyboard: TelegramBot.KeyboardButton[][] = []
      for (let i = 0; i < payNames.length; i++) {
        keyboard.push([{ text: payNames[i] }])
      }
      await tBot.sendMessage(msg.chat.id, user.__('paymethod_add'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboard,
          one_time_keyboard: false,
          resize_keyboard: true
        }
      })
      return true
    case 'showPayments':
      if (query.showPayments && query.showPayments.paymentId) {
        const pmName = user.__(
          'paymethod' + query.showPayments.paymentId + '_name'
        )
        const pmFields = await PaymentDetail.getLocaleFields(user, pmName)
        if (!pmFields) return true
        const fields: string[] = [],
          pmethod = await PaymentMethod.findOne({
            where: { paymentId: query.showPayments.paymentId, userId: user.id }
          })
        if (!pmethod) return true
        fields.push(
          pmethod.field1,
          pmethod.field2,
          pmethod.field3,
          pmethod.field4
        )
        let message: string = user.__('paymethod_show %s', pmName)
        for (let i = 0; i < pmFields.length; i++) {
          message =
            message +
            user.__('paymethod_field_show %s %s', pmFields[i], fields[i])
        }
        pmFields &&
          (await tBot.sendMessage(tUser.id, message, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: user.__('delete'),
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
                    text: user.__('edit'),
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
          }))
      } else {
        const pmNames = await PaymentDetail.getPaymethodNames(user, true)
        const inline: TelegramBot.InlineKeyboardButton[][] = []
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
          ])
        }
        inline.push([
          {
            text: user.__('add_another_payment_method'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.AddPayment,
              null,
              null
            )
          }
        ])
        tBot.sendMessage(tUser.id, user.__('list_payment_methods'), {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: inline,
            one_time_keyboard: false,
            resize_keyboard: true
          }
        })
      }
      return true
    case 'deletePayment':
      if (!query || !query.deletePayment || !query.deletePayment.paymentId)
        return true
      const pmName = user.__(
        'paymethod' + query.deletePayment.paymentId + '_name'
      )
      console.log(
        'DELETING: ' + user.id + ',  ' + query.deletePayment.paymentId
      )

      await PaymentMethod.destroy({
        where: { userId: user.id, paymentId: query.deletePayment.paymentId }
      })
      await tBot.sendMessage(
        tUser.id,
        user.__('paymethod_deleted %s', pmName),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true
    case 'editPayment':
      if (!query || !query.editPayment || !query.editPayment.paymentId)
        return true
      const pmName1 = user.__(
        'paymethod' + query.editPayment.paymentId + '_name'
      )
      showAddPayment(pmName1, user, tUser)
      return true
    case 'myOrders':
      await tBot.sendMessage(tUser.id, '[TODO] Handle open orders', {})
      return true
    case 'sendMessage':
      if (!query || !query.sendMessage || !query.sendMessage.accountId)
        return true
      await cacheClient.hmsetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.currentContext,
        CONTEXT_SENDMESSAGE,
        cacheKeys.tContext['SendMessage.accountId'],
        query.sendMessage.accountId
      )
      cacheClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry)
      const receiverUser: User | null = await User.findOne({
        where: { accountId: query.sendMessage.accountId }
      })
      const receiverBlockedUsers: number[] = receiverUser
        ? JSON.parse(receiverUser.blockedUsers)
        : []
      const amIBlocked: boolean =
        receiverUser != null && receiverBlockedUsers.indexOf(user.id) > -1
      if (amIBlocked) {
        await cacheClient.delAsync(cacheKeys.tContext.key)
        tBot.sendMessage(tUser.id, user.__('send_message_not_allowed'), {
          parse_mode: 'Markdown'
        })
      } else if (receiverUser) {
        const myBlockList: number[] = JSON.parse(user.blockedUsers)
        if (myBlockList.indexOf(receiverUser.id) > -1) {
          await cacheClient.delAsync(cacheKeys.tContext.key)
          tBot.sendMessage(tUser.id, user.__('send_error_user_blocked'), {
            parse_mode: 'Markdown'
          })
        } else {
          tBot.sendMessage(tUser.id, user.__('enter_send_message'), {
            parse_mode: 'Markdown'
          })
        }
      } else {
        await cacheClient.delAsync(cacheKeys.tContext.key)
        sendErrorMessage(user, tUser)
      }
      return true
    case 'blockAccount':
      if (!query || !query.blockAccount || !query.blockAccount.accountId)
        return true
      const blockedUsers1: number[] = JSON.parse(user.blockedUsers)
      console.log(
        'BLOCK: ' +
          query.blockAccount.shouldBlock +
          ', ' +
          JSON.stringify(blockedUsers1) +
          ' ' +
          typeof query.blockAccount.shouldBlock
      )
      const b: User | null = await User.findOne({
        where: { accountId: query.blockAccount.accountId }
      })
      if (b) {
        console.log(
          '>>>> ' +
            JSON.stringify(b) +
            ', ' +
            !query.blockAccount.shouldBlock +
            ', ' +
            (blockedUsers1.indexOf(b.id) > -1)
        )
        if (query.blockAccount.shouldBlock == 0 && blockedUsers1) {
          // to unblock
          console.log('unblocking...')
          blockedUsers1.splice(blockedUsers1.indexOf(b.id), 1)
        } else if (
          query.blockAccount.shouldBlock &&
          blockedUsers1.indexOf(b.id) <= -1
        ) {
          // to block
          console.log('blocking...')
          blockedUsers1.push(b.id)
        }
      } else {
        sendErrorMessage(user, tUser)
      }
      await User.update(
        { blockedUsers: JSON.stringify(blockedUsers1) },
        { where: { id: user.id } }
      )
      await new CacheStore(tUser.id).clearUserCache()
      msg.message_id = query.messageId
      user.blockedUsers = JSON.stringify(blockedUsers1)
      showAccount(query.blockAccount.accountId, msg, user, tUser)
      return true
    default:
      return false
  }
}

const accountContext = async function(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  context: string
): Promise<boolean> {
  const cacheKeys = new CacheStore(tUser.id).getKeys()
  const cacheClient = await cacheConnection.getCacheClient()
  await cacheClient.hmsetAsync(
    cacheKeys.tContext.key,
    cacheKeys.tContext.currentContext,
    '',
    cacheKeys.tContext['SendMessage.accountId'],
    ''
  )
  if (context === CONTEXT_SENDMESSAGE) {
    const [sendAccount] = await cacheClient.hmgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext['SendMessage.accountId']
    )
    await cacheClient.delAsync(cacheKeys.tContext.key)
    const sendUser: User | null = await User.findOne({
      where: { accountId: sendAccount.toLowerCase() },
      include: [TelegramAccount]
    })
    if (sendUser && (msg.text || msg.photo)) {
      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: user.__('send_response_message'),
              callback_data: stringifyCallbackQuery(
                ICallbackFunction.SendMessage,
                null,
                { accountId: user.accountId }
              )
            }
          ]
        ]
      }
      if (msg.text) {
        await tBot.sendMessage(
          sendUser.telegramUser.id,
          user.__('new_message %s', '/u' + user.accountId.toUpperCase()) +
            '\n\n' +
            msg.text,
          {
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
          }
        )
      } else if (msg.photo) {
        await tBot.sendMessage(
          sendUser.telegramUser.id,
          user.__('new_message %s', '/u' + user.accountId.toUpperCase()),
          {
            parse_mode: 'Markdown'
          }
        )
        await tBot.sendPhoto(sendUser.telegramUser.id, msg.photo[0].file_id, {
          reply_markup: replyMarkup
        })
      }
      await tBot.sendMessage(
        tUser.id,
        user.__(
          'message_send_success %s',
          '/u' + sendUser.accountId.toUpperCase()
        ),
        {}
      )
    } else {
      await tBot.sendMessage(tUser.id, user.__('message_send_failed'), {})
    }
    return true
  } else if (context === CONTEXT_ADDPAYMETHOD) {
    showAddPayment(msg.text || '', user, tUser)
    return true
  } else if (msg.text && context === CONTEXT_ENTERPAYMETHOD) {
    await cacheClient.expireAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.expiry
    )
    const fields: string[] = JSON.parse(
      await cacheClient.hgetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext['EnterPayMethod.fields']
      )
    )
    const methodName = await cacheClient.hgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext['EnterPayMethod.methodName']
    )
    fields.push(msg.text)
    await cacheClient.hmsetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.currentContext,
      CONTEXT_ENTERPAYMETHOD,
      cacheKeys.tContext['EnterPayMethod.fields'],
      JSON.stringify(fields)
    )

    const pmFields = await PaymentDetail.getLocaleFields(user, methodName)
    if (pmFields && fields.length < pmFields.length) {
      pmFields &&
        (await tBot.sendMessage(
          tUser.id,
          user.__('paymethod_enter_field %s', pmFields[fields.length]),
          {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [[]]
            }
          }
        ))
    } else if (pmFields) {
      if (msg.text === user.__('confirm')) {
        cacheClient.delAsync(cacheKeys.tContext.key)
        // TODO: SAVE payment method
        const paymentId = await PaymentDetail.getPaymethodID(user, methodName)
        const insert: any = {
          userId: user.id,
          paymentId: paymentId,
          field1: fields[0]
        }
        console.log('LENGTH: ' + pmFields.length)
        if (pmFields.length >= 2) insert['field2'] = fields[1]
        if (pmFields.length >= 3) insert['field3'] = fields[2]
        if (pmFields.length >= 4) insert['field4'] = fields[3]

        await PaymentMethod.destroy({
          where: { userId: user.id, paymentId: paymentId }
        })
        const pm = new PaymentMethod(insert)
        await pm.save()

        pmFields &&
          (await tBot.sendMessage(
            tUser.id,
            user.__('paymethod_saved %s', methodName),
            {
              parse_mode: 'Markdown',
              reply_markup: {
                keyboard: keyboardMenu(user),
                one_time_keyboard: false,
                resize_keyboard: true
              }
            }
          ))
      } else if (msg.text === user.__('cancel')) {
        await cacheClient.delAsync(cacheKeys.tContext.key)
        tBot.sendMessage(tUser.id, user.__('context_action_cancelled'), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        })
      } else {
        let message: string = user.__('paymethod_add_confirm %s', methodName)
        for (let i = 0; i < pmFields.length; i++) {
          message =
            message +
            user.__('paymethod_field_show %s %s', pmFields[i], fields[i])
        }
        pmFields &&
          (await tBot.sendMessage(tUser.id, message, {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [
                [{ text: user.__('confirm') }],
                [{ text: user.__('cancel') }]
              ],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          }))
      }
    }
    return true
  } else {
    return false
  }
}

async function showAddPayment(
  paymethod: string,
  user: User,
  tUser: TelegramAccount
) {
  const cacheClient = await cacheConnection.getCacheClient()
  const cacheKeys = new CacheStore(tUser.id).getKeys()
  if (
    paymethod &&
    (await PaymentDetail.isPaymethodNameExists(user, paymethod))
  ) {
    await cacheClient.hmsetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.currentContext,
      CONTEXT_ENTERPAYMETHOD,
      cacheKeys.tContext['EnterPayMethod.methodName'],
      paymethod,
      cacheKeys.tContext['EnterPayMethod.fields'],
      '[]'
    )
    await cacheClient.expireAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.expiry
    )
    const pmFields = await PaymentDetail.getLocaleFields(user, paymethod)
    pmFields &&
      (await tBot.sendMessage(
        tUser.id,
        user.__('paymethod_enter_heading %s %s', paymethod, pmFields[0]),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[{ text: user.__('cancel_text') }]],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      ))
  } else {
    await cacheClient.delAsync(cacheKeys.tContext.key)
    await tBot.sendMessage(tUser.id, 'Invalid input. Please try again.', {})
  }
}

async function showMyAccount(
  msg: TelegramBot.Message,
  user: User,
  _tUser: TelegramAccount
) {
  let addPaymentInline
  const pmNames = await PaymentDetail.getPaymethodNames(user, true)
  if (pmNames.length === 0) {
    addPaymentInline = {
      text: user.__('add_payment_method'),
      callback_data: stringifyCallbackQuery(
        ICallbackFunction.AddPayment,
        null,
        null
      )
    }
  } else {
    addPaymentInline = {
      text: user.__('show_payment_methods'),
      callback_data: stringifyCallbackQuery(
        ICallbackFunction.ShowPayments,
        null,
        null
      )
    }
  }
  const inlineSettings = {
    text: user.__('menu_settings'),
    callback_data: stringifyCallbackQuery(
      ICallbackFunction.Settings,
      null,
      null
    )
  }
  const secondInline = !user.isVerified
    ? [
        { text: user.__('verify_account'), url: 'http://google.com' },
        inlineSettings
      ]
    : [inlineSettings]

  let pmethodMessage = pmNames.length > 0 ? '' : user.__('not_added')
  for (let i = 0; i < pmNames.length; i++) {
    if (i === pmNames.length - 1) pmethodMessage = pmethodMessage + pmNames[i]
    else pmethodMessage = pmethodMessage + ' ' + pmNames[i] + ','
  }
  const verificationMessage = user.isVerified
    ? user.__('account_verified')
    : user.__('account_not_verified')
  await tBot.sendMessage(
    msg.chat.id,
    user.__(
      'show_my_account %s %d %f %f %d %d %d %d %d %s',
      '/u' + user.accountId.toUpperCase(),
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
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[addPaymentInline], secondInline],
        one_time_keyboard: false,
        resize_keyboard: true
      }
    }
  )
}

async function showAccount(
  accountId: string,
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount
) {
  console.log(
    'ACCOUNT: ' +
      accountId +
      ', ' +
      JSON.stringify(msg) +
      ', ' +
      JSON.stringify(user)
  )
  if (!msg.text || !msg.entities) return
  const cacheClient = await cacheConnection.getCacheClient()
  const cacheKeys = new CacheStore(tUser.id).getKeys()
  await cacheClient.hmsetAsync(
    cacheKeys.tContext.key,
    cacheKeys.tContext.currentContext,
    ''
  )
  const showUser: User | null = await User.findOne({
    where: { accountId: accountId }
  })
  if (showUser) {
    const blockedUsers: number[] = JSON.parse(user.blockedUsers)
    const isUserBlocked = blockedUsers.indexOf(showUser.id) > -1
    const blockUnblockMessage = isUserBlocked
      ? user.__('unblock_account')
      : user.__('block_account')

    const inlineMessageId =
      msg && msg.from && msg.from.is_bot
        ? msg.message_id
        : msg
        ? msg.message_id + 1
        : null
    const inlineKeyboard: TelegramBot.InlineKeyboardMarkup = {
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
            text: user.__('send_message'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.SendMessage,
              null,
              { accountId: accountId }
            )
          }
        ],
        [
          {
            text: user.__('open_orders %d', 1),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.MyOrders,
              null,
              { accountId: accountId }
            )
          }
        ]
      ]
    }

    const verificationMessage = showUser.isVerified
      ? showUser.__('account_verified')
      : showUser.__('account_not_verified')
    const lastActive = moment().diff(showUser.updatedAt, 'm')
    let message: string = user.__(
      'show_other_account %s %d %f %f %d %d %s %d %s %d',
      '/u' + accountId.toUpperCase(),
      1,
      0.0001,
      4.8,
      4,
      1,
      verificationMessage,
      '10',
      'PayTM, UPI, IMPS',
      lastActive
    )
    if (isUserBlocked) message = message + user.__('account_block_info')
    if (accountId.toLowerCase() === user.accountId) {
      message = message + user.__('my_account_info')
    }
    if (msg && msg.from && msg.from.is_bot) {
      // callback query
      await tBot.editMessageText(message, {
        parse_mode: 'Markdown',
        chat_id: tUser.id,
        message_id: msg.message_id,
        reply_markup: inlineKeyboard,
        disable_web_page_preview: true
      })
    } else if (msg) {
      await tBot.sendMessage(msg.chat.id, message, {
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      })
    }
  } else {
    // account not found
    await tBot.sendMessage(
      msg.chat.id,
      user.__('account_not_available %s', accountId.toUpperCase()),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      }
    )
  }
}

async function handleReferrals(
  msg: TelegramBot.Message,
  user: User,
  _tUser: TelegramAccount
) {
  await tBot.sendMessage(msg.chat.id, '[TODO] HANDLE REFERRALS ', {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: keyboardMenu(user),
      one_time_keyboard: false,
      resize_keyboard: true
    }
  })
}

export { accountConversation, accountCallback, accountContext }
