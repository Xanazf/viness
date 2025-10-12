import { createApp } from './app'
import { config } from './config/env'
import { connectDatabase, sequelize } from './db'
import { migrate } from './db/migrate'
import { registerProcessHandlers } from './store/lifecycle'
import { connectMongo } from './store/mongo'
import { logger } from './utils/logger'

async function bootstrap() {
  await connectDatabase()
  await migrate({ force: config.db.sync?.force ?? false })
  if (process.env.BACKEND_STORE === 'mongo') {
    await connectMongo()
    logger.info('MongoDB connected')
  }

  const app = createApp()
  registerProcessHandlers()
  logger.info('Process handlers registered')

  // Dangerous dev-only flush route
  if (config.allowDangerousFlush) {
    app.get('/flush', async (_req: import('express').Request, res: import('express').Response) => {
      try {
        await sequelize.drop({ cascade: true })
        logger.warn('All tables dropped successfully')
        res.send('database flushed')
      } catch (error) {
        logger.error({ err: error }, 'Error dropping tables')
        res.status(500).send('error flushing database')
      }
    })
  }

  app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Server listening')
  })
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal error during bootstrap')
  process.exit(1)
})
