import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/viness'

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(MONGO_URI)
}

export function disconnectMongo() {
  return mongoose.disconnect()
}
