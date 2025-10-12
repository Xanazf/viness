import { sequelize } from '../db'
import mongoose from 'mongoose'
import { logger } from '../utils/logger'

let shuttingDown = false

export async function gracefulShutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'Shutting down gracefully')

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
      logger.info('MongoDB disconnected')
    }
  } catch (e) {
    logger.error({ err: e }, 'Error disconnecting MongoDB')
  }

  try {
    await sequelize.close()
    logger.info('Sequelize connection closed')
  } catch (e) {
    logger.error({ err: e }, 'Error closing Sequelize connection')
  }

  process.exit(0)
}

export function registerProcessHandlers() {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
  for (const s of signals) {
    process.on(s, () => void gracefulShutdown(s))
  }
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught Exception')
  })
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled Rejection')
  })
}
