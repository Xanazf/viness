import express from 'express'
import bodyParser from 'body-parser'
import apiRouter from './routes'
import { notFound } from './middlewares/notFound'
import { errorHandler } from './middlewares/errorHandler'
import { requestLogger } from './middlewares/requestLogger'

export function createApp() {
  const app = express()
  app.use(requestLogger)
  // forward request id to response header for downstream correlation
  app.use((req, res, next) => {
    const id = (req as any).id
    if (id) res.setHeader('x-request-id', id)
    next()
  })
  // attach request-scoped logger with id in bindings (req.log from pino-http)
  app.use((_req, _res, next) => next())
  app.use(bodyParser.json())

  // mount API routes
  app.use('/api', apiRouter)

  // 404 handler
  app.use(notFound)
  // error handler
  app.use(errorHandler)

  return app
}

export default createApp
