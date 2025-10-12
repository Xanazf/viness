import { fetch as undiciFetch, type RequestInit, type Response } from 'undici'
import type { Request } from 'express'
import { logger } from './logger'

export interface HttpClientOptions extends RequestInit {
  req?: Request
  url: string
}

export interface PostJsonOptions<TBody> extends Omit<HttpClientOptions, 'body' | 'method'> {
  body: TBody
}

export class HttpError<T = unknown> extends Error {
  constructor(
    message: string,
    public status: number,
    public body: T | string | null,
    public url: string,
    public method: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

function parseMaybeJson<T>(res: Response, text: string): T | string {
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text) as T
    } catch {
      // fallthrough
    }
  }
  return text
}

export async function postJson<TResp = unknown, TBody = unknown>({ url, body, req, headers, ...rest }: PostJsonOptions<TBody>): Promise<TResp> {
  const hdrs: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json',
    ...(headers as any),
  }
  return httpRequest<TResp>({ url, req, headers: hdrs, method: 'POST', body: JSON.stringify(body), ...rest })
}

export async function putJson<TResp = unknown, TBody = unknown>({ url, body, req, headers, ...rest }: PostJsonOptions<TBody>): Promise<TResp> {
  const hdrs: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json',
    ...(headers as any),
  }
  return httpRequest<TResp>({ url, req, headers: hdrs, method: 'PUT', body: JSON.stringify(body), ...rest })
}

export async function patchJson<TResp = unknown, TBody = unknown>({ url, body, req, headers, ...rest }: PostJsonOptions<TBody>): Promise<TResp> {
  const hdrs: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json',
    ...(headers as any),
  }
  return httpRequest<TResp>({ url, req, headers: hdrs, method: 'PATCH', body: JSON.stringify(body), ...rest })
}

export async function deleteJson<TResp = unknown>({ url, req, headers, ...rest }: Omit<HttpClientOptions, 'method'>): Promise<TResp> {
  const hdrs: Record<string, string> = {
    accept: 'application/json',
    ...(headers as any),
  }
  return httpRequest<TResp>({ url, req, headers: hdrs, method: 'DELETE', ...rest })
}

export async function httpRequest<T = unknown>({ url, req, headers, ...init }: HttpClientOptions): Promise<T> {
  const reqId = (req as any)?.id
  const hdrs: Record<string, string> = {
    ...(headers as any),
  }
  if (reqId && !hdrs['x-request-id']) {
    hdrs['x-request-id'] = String(reqId)
  }

  const method = (init.method || 'GET').toUpperCase()
  const start = Date.now()
  try {
    const res = await undiciFetch(url, { ...init, headers: hdrs })
    const rt = Date.now() - start
    const bodyText = await res.text()

    if (!res.ok) {
      const parsed = parseMaybeJson<any>(res, bodyText)
      logger.warn({ reqId, url, method, status: res.status, rt, body: parsed }, 'HTTP non-2xx response')
      throw new HttpError('HTTP error', res.status, parsed, url, method)
    }

    logger.info({ reqId, url, method, status: res.status, rt }, 'HTTP request completed')

    const parsed = parseMaybeJson<T>(res, bodyText)
    return parsed as T
  } catch (err) {
    const rt = Date.now() - start
    logger.error({ reqId, url, method, err, rt }, 'HTTP request failed')
    throw err
  }
}
