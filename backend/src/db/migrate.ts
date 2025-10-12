import { sequelize } from './index'
import { User } from './models/User'

export type SyncOptions = {
  force?: boolean
  alter?: boolean
}

export async function registerModels() {
  // touch imports to ensure model is registered
  void User
}

export async function migrate({ force = false, alter = false }: SyncOptions = {}) {
  await registerModels()
  await sequelize.sync({ force, alter })
}
