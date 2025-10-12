import { userStore as sequelizeUserStore } from './userStore'
import { userStoreLowdb } from './userStore.lowdb'
import { userStoreMongo } from './userStore.mongo'

const backendStore = process.env.BACKEND_STORE ?? 'sequelize' // 'lowdb' | 'sequelize' | 'mongo'

export const stores = {
  users: backendStore === 'lowdb' ? userStoreLowdb : backendStore === 'mongo' ? userStoreMongo : sequelizeUserStore,
}
