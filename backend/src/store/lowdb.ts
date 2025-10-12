import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

type UserRow = {
  id: number
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

type DBSchema = {
  users: UserRow[]
  _meta: { lastId: number }
}

const dataDir = join(process.cwd(), 'backend', '.data')
const file = join(dataDir, 'db.json')

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const adapter = new JSONFile<DBSchema>(file)
export const db = new Low<DBSchema>(adapter, { users: [], _meta: { lastId: 0 } })

export async function initLowdb() {
  await db.read()
  // Ensure defaults applied
  db.data ||= { users: [], _meta: { lastId: 0 } }
  await db.write()
}
