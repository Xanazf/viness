import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === 'number' ? err.status : 500
  const message = err?.message ?? 'Internal Server Error'
  if (status >= 500) {
    // log stack for server errors
    // eslint-disable-next-line no-console
    console.error(err)
  }
  res.status(status).json({ error: message })
}
