import * as TelegramBot from 'node-telegram-bot-api'
import { cacheConnection } from 'modules'
import { TelegramGroup, TelegramAccount, User } from '../models'
import { CONFIG } from '../config'
import { i18n, telegramHook } from 'modules'
import * as _ from 'lodash'
import { linkCreator } from 'utils/linkCreator'
import { dataFormatter } from 'utils/dataFormatter'
import { FiatCurrency } from 'constants/currencies'
import logger from 'modules/logger'
import axios from 'axios'

export async function handleChannel(msg: TelegramBot.Message) {
  const group = await TelegramGroup.getGroup(msg.chat.id)
  if (!group) {
    const chatAdmins = await telegramHook.getWebhook.getChatAdministrators(
      msg.chat.id
    )
    const admin = _.find(
      chatAdmins,
      (aa) => _.get(aa, 'user.is_bot', false) == false
    )
    if (!admin) {
      logger.warn('Could not find admin for channel')
      return
    }

    // @ts-ignore
    const newGroup = await TelegramGroup.createGroup(msg.chat.id, admin.user.id)
    // @ts-ignore
    await sendWelcomeMessage(newGroup, admin.user)
  } else {
    await handleMessage(group, msg, 'channel')
  }
}
export async function handleGroupMessage(msg: TelegramBot.Message) {
  const group = await TelegramGroup.getGroup(msg.chat.id)
  if (!msg.from) {
    return
  }
  if (!group) {
    const newGroup = await TelegramGroup.createGroup(msg.chat.id, msg.from.id)
    await sendWelcomeMessage(newGroup, msg.from)
  } else {
    if (msg.new_chat_members) {
      if (
        _.find(
          msg.new_chat_members,
          (n) =>
            n.username &&
            n.username.toLowerCase() == CONFIG.BOT_USERNAME.toLowerCase()
        )
      ) {
        await sendWelcomeMessage(group, msg.from)
        return
      }
    } else if (
      msg.left_chat_member &&
      msg.left_chat_member.username &&
      msg.left_chat_member.username.toLowerCase() ==
        CONFIG.BOT_USERNAME.toLowerCase()
    ) {
      await group.destroy()
      return
    }

    handleMessage(group, msg, 'group')
  }
}

async function handleMessage(
  group: TelegramGroup,
  msg: TelegramBot.Message,
  chatType: 'channel' | 'group'
) {
  if (msg.text && msg.text.startsWith('/rate')) {
    sendRate(group)
  } else if (
    msg.text &&
    (msg.text.startsWith('/setDailyLimit') ||
      msg.text.startsWith('/setdailylimit'))
  ) {
    const tUser = await TelegramAccount.findById(group.telegramId, {
      include: [{ model: User }]
    })

    const value = parseInt(msg.text.replace(/[^0-9\.]+/g, ''))
    if (isNaN(value) || value < 0 || value > 24) {
      const message =
        tUser && tUser.user
          ? tUser.user.t('group.invalid-limit-number')
          : i18n.getI18n.t('group.invalid-limit-number')
      await telegramHook.getWebhook.sendMessage(
        group.telegramGroupId,
        message,
        {
          parse_mode: 'Markdown'
        }
      )
      return
    }
    if (chatType === 'channel') {
      group.update({
        dailyAlertLimit: value
      })
      const message =
        tUser && tUser.user
          ? tUser.user.t('group.limit-updated')
          : i18n.getI18n.t('group.limit-updated')
      await telegramHook.getWebhook.sendMessage(
        group.telegramGroupId,
        message,
        {
          parse_mode: 'Markdown'
        }
      )
    } else {
      const admins = await telegramHook.getWebhook.getChatAdministrators(
        group.telegramGroupId
      )
      const fromId = _.get(msg.from, 'id', undefined)
      if (fromId) {
        const adminUser = _.find(
          admins,
          (aa) => _.get(aa, 'id', fromId) == _.get(aa, 'user.id', -1)
        )
        if (adminUser) {
          group.update({
            dailyAlertLimit: value
          })
          const message =
            tUser && tUser.user
              ? tUser.user.t('group.limit-updated')
              : i18n.getI18n.t('group.limit-updated')
          await telegramHook.getWebhook.sendMessage(
            group.telegramGroupId,
            message,
            {
              parse_mode: 'Markdown'
            }
          )
        } else {
          const message =
            tUser && tUser.user
              ? tUser.user.t('group.unauthorized')
              : i18n.getI18n.t('group.unauthorized')
          await telegramHook.getWebhook.sendMessage(
            group.telegramGroupId,
            message,
            {
              parse_mode: 'Markdown'
            }
          )
        }
      }
    }
  }
}

export async function sendRate(group: TelegramGroup) {
  const MEGA_GROUP_ID = -1001288521180
  const CMC_CACHE_KEY = 'cmc-ticker-btc-usd'
  let cmc: {
    change1h: number
    price: number
    volume24h: number
    change24h: number
    change7d: number
  }

  const cacheCmc = await cacheConnection.getClient.getAsync(CMC_CACHE_KEY)
  if (cacheCmc) {
    cmc = JSON.parse(cacheCmc)
    logger.info('TICKER: GOT cmc from Cache')
  } else {
    logger.info('TICKER: Fetching CMC')
    const axiosInstance = axios.create({
      baseURL: `https://pro-api.coinmarketcap.com/v1/`,
      responseType: 'json',
      headers: {
        'X-CMC_PRO_API_KEY': 'dcc587ca-1281-4df2-82a0-c094b811deac'
      }
    })
    const response = await axiosInstance.get(
      'cryptocurrency/quotes/latest?symbol=BTC&convert=USD'
    )
    const ticker = _.get(response, 'data.data.BTC.quote.USD')

    cmc = {
      change1h: ticker.percent_change_1h,
      price: ticker.price,
      volume24h: ticker.volume_24h,
      change24h: ticker.percent_change_24h,
      change7d: ticker.percent_change_7d
    }

    await cacheConnection.getClient.setAsync(
      CMC_CACHE_KEY,
      JSON.stringify(cmc),
      'EX',
      3600
    )
  }

  const rate = {
    volume24h: parseInt(cmc.volume24h + ''),
    price: parseInt(cmc.price + ''),
    change1h: addSignToNum(cmc.change1h.toPrecision(2)),
    change24h: addSignToNum(cmc.change24h.toPrecision(2)),
    change7d: addSignToNum(cmc.change7d.toPrecision(2))
  }
  let link, rateTransKey, transOptions, message, ctaText
  const tUser = await TelegramAccount.findOne({
    where: {
      id: group.telegramId
    },
    include: [{ model: User }]
  })

  if (cmc.change1h < 0) {
    rateTransKey = 'group.rate-alert-down'
    transOptions = {
      change1h: rate.change1h,
      change24h: rate.change24h,
      formattedRate: dataFormatter.formatFiatCurrency(
        rate.price,
        FiatCurrency.USD
      ),

      formattedVolume24h: dataFormatter.formatFiatCurrency(
        rate.volume24h,
        FiatCurrency.USD
      ),
      change7d: rate.change7d
    }
  } else {
    rateTransKey = 'group.rate-alert-up'
    transOptions = {
      change1h: rate.change1h,
      change24h: rate.change24h,
      formattedRate: dataFormatter.formatFiatCurrency(
        rate.price,
        FiatCurrency.USD
      ),

      formattedVolume24h: dataFormatter.formatFiatCurrency(
        rate.volume24h,
        FiatCurrency.USD
      ),
      change7d: rate.change7d
    }
  }

  if (tUser) {
    link = linkCreator.getReferralLink(tUser.user.accountId)
    message = tUser.user.t(rateTransKey, transOptions)
    ctaText = tUser.user.t('group.exchange-btc')

    if (group.telegramGroupId == MEGA_GROUP_ID) {
      message = `${message}\n\n${tUser.user.t('group.special-message')}`
    }
  } else {
    link = `https://t.me/${CONFIG.BOT_USERNAME}`
    message = i18n.getI18n.t(rateTransKey, transOptions)
    ctaText = i18n.getI18n.t('group.exchange-btc')

    if (group.telegramGroupId == MEGA_GROUP_ID) {
      message = `${message}\n\n${i18n.getI18n.t('group.special-message')}`
    }
  }

  await telegramHook.getWebhook.sendMessage(group.telegramGroupId, message, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctaText,
            url: link
          }
        ]
      ]
    }
  })

  TelegramGroup.updateMessageCount(group.telegramGroupId)
}

function addSignToNum(num: number | string): string {
  num = parseFloat(num + '')
  return (num < 0 ? '' : '+') + num
}

async function sendWelcomeMessage(
  group: TelegramGroup,
  from: TelegramBot.User
) {
  const tAccount = await TelegramAccount.findById(from.id, {
    include: [{ model: User }]
  })
  let welcomeMessage
  if (!tAccount) {
    // The user is not registered
    welcomeMessage =
      i18n.getI18n.t('group.welcome') +
      '\n\n' +
      i18n.getI18n.t('group.account-not-linked', {
        telegramName: from.first_name,
        telegramUserId: from.id,
        botUsername: CONFIG.BOT_USERNAME
      })
    telegramHook.getWebhook.sendMessage(group.telegramGroupId, welcomeMessage, {
      parse_mode: 'Markdown',
      disable_notification: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Link account',
              url: `https://t.me/${CONFIG.BOT_USERNAME}`
            }
          ]
        ]
      }
    })
  } else {
    await group.update({
      userId: tAccount.userId
    })

    welcomeMessage =
      tAccount.user.t('group.welcome') +
      '\n\n' +
      i18n.getI18n.t('group.account-linked', {
        telegramName: tAccount.firstName,
        telegramUserId: tAccount.id,
        botUsername: CONFIG.BOT_USERNAME
      })
    telegramHook.getWebhook.sendMessage(group.telegramGroupId, welcomeMessage, {
      parse_mode: 'Markdown',
      disable_notification: true
    })
  }
}
