import * as url from 'url'
import axios, { AxiosInstance } from 'axios'
import logger from 'modules/logger'
import * as _ from 'lodash'

type RpcProtocol = 'http' | 'https'

export interface RpcResult {
  result: object | null
  error: {
    code: number
    message: string
  } | null
  id: number
}

const getRandomId = (): number => {
  return Math.random() * 100000
}

const decodeURL = (str: string) => {
  const parsedUrl = url.parse(str)

  if (
    !parsedUrl.port ||
    !parsedUrl.protocol ||
    !parsedUrl.auth ||
    !parsedUrl.hostname
  ) {
    throw new Error('RPC port/parsedUrl/auth is not defined')
  }

  const hostname = parsedUrl.hostname
  const port = parseInt(parsedUrl.port, 10)
  let protocol = parsedUrl.protocol

  // strip trailing ":"
  protocol = protocol.substring(0, protocol.length - 1)
  const auth = parsedUrl.auth
  const parts = auth.split(':')
  const user = parts[0] ? decodeURIComponent(parts[0]) : null
  const pass = parts[1] ? decodeURIComponent(parts[1]) : null

  if (!user || !pass) {
    throw new Error('RPC user/pass undefined')
  }

  const opts = {
    host: hostname,
    port: port,
    protocol: protocol as RpcProtocol,
    user: user,
    pass: pass
  }
  return opts
}

const noop = function() {}
const loggers = {
  none: { info: noop, warn: noop, err: noop, debug: noop },
  normal: {
    info: logger.info,
    warn: logger.info,
    err: logger.error,
    debug: noop
  },
  debug: {
    info: logger.info,
    warn: logger.info,
    err: logger.info,
    debug: console.log
  }
}

export class RpcClient {
  axiosInstance: AxiosInstance
  log: {
    info: (msg: string) => void
    warn: (msg: string) => void
    err: (msg: string) => void
    debug: (msg: string) => void
  }

  constructor(
    opts:
      | {
          host: string
          port: number
          user: string
          pass: string
          protocol: RpcProtocol
          disableAgent?: boolean
        }
      | string
  ) {
    // opts can ba an URL string
    if (typeof opts === 'string') {
      opts = decodeURL(opts)
    }

    this.axiosInstance = axios.create({
      baseURL: `${opts.protocol}://${opts.host}:${opts.port}/`,
      responseType: 'json',
      auth: {
        username: opts.user,
        password: opts.pass
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (process.env.NODE_ENV === 'development') {
      this.log = loggers.debug
    } else {
      this.log = loggers.normal
    }
  }

  async rpc(method: string, params: (string | number)[]) {
    let resp

    try {
      resp = await this.axiosInstance.post('/', {
        id: getRandomId(),
        method,
        params
      })
    } catch (e) {
      logger.error('RPC error status code: ' + JSON.stringify(e.response.data))
      if (e.response.data && e.response.data.error) {
        resp = e.response
      } else {
        throw e
      }
    }

    const result = _.get(resp.data, 'result', null) as RpcResult['result']
    const error = _.get(resp.data, 'error', null) as RpcResult['error']

    return {
      data: result,
      error,
      id: resp.data.id
    }
  }
}
