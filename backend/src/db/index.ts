import { Sequelize } from 'sequelize'
import { config } from '../config/env'

export const sequelize = new Sequelize({
  dialect: config.db.dialect,
  storage: config.db.storage,
})

import { logger } from '../utils/logger'

export async function connectDatabase() {
  try {
    await sequelize.authenticate()
    logger.info('Database online')
  } catch (err) {
    logger.error({ err }, 'Database failed to connect')
    throw err
  }
}

export async function syncDatabase() {
  try {
    await sequelize.sync(config.db.sync)
    logger.info('Database synced')
  } catch (err) {
    logger.error({ err }, 'Database failed to sync')
    throw err
  }
}
