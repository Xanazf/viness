import pinoHttp from 'pino-http'
import { logger } from '../utils/logger'
import redact from 'slow-redact'

const redactor = redact({
  paths: [
    'req.headers.authorization',
    'req.body.password',
    'req.body.token',
    'req.body.access_token',
    'res.headers[set-cookie]',
  ],
  censor: '[REDACTED]'
})

let counter = 0
function genReqId(req: any) {
  // Use header if provided, else generate
  const hdr = req.headers['x-request-id'] || req.headers['x-correlation-id']
  if (hdr && typeof hdr === 'string') return hdr
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER
  return `${Date.now().toString(36)}-${counter.toString(36)}`
}

export const requestLogger = pinoHttp({
  logger,
  genReqId,
  customLogLevel: function (res: any, err) {
    const code = res?.statusCode ?? 200
    if (code >= 500 || err) return 'error'
    if (code >= 400) return 'warn'
    return 'info'
  },
  autoLogging: {
    ignore: (req) => {
      const url = req.url || ''
      // Skip health checks and static assets
      if (url === '/api/ping' || url === '/api/health') return true
      if (url.startsWith('/assets') || url.startsWith('/static') || url.startsWith('/favicon')) return true
      return false
    },
  },
  customSuccessMessage(req, res) {
    const route = (req as any).route?.path || (req as any).originalUrl || req.url
    const method = req.method
    return `request completed: id=${(req as any).id} ${method} ${route} status=${res.statusCode} rt=${(res as any).responseTime}ms`
  },
  customProps(req, res) {
    const route = (req as any).route?.path || (req as any).originalUrl || req.url
    return {
      reqId: (req as any).id,
      route,
      method: req.method,
      responseTime: (res as any).responseTime,
    }
  },
  serializers: {
    req(req) {
      const body = redactor(req.body ?? {})
      const route = (req as any).route?.path || (req as any).originalUrl || req.url
      return {
        id: (req as any).id,
        method: req.method,
        route,
        url: req.url,
        remoteAddress: req.socket?.remoteAddress,
        remotePort: req.socket?.remotePort,
        headers: redactor({ ...req.headers }),
        body,
      }
    },
    res(res) {
      const headers = typeof res.getHeaders === 'function' ? res.getHeaders() : undefined
      const safeHeaders = headers ? redactor(headers as any) : undefined
      return {
        statusCode: res.statusCode,
        headers: safeHeaders,
      }
    },
  },
})
