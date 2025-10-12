import { describe, it, expect, beforeEach } from 'vitest'
import { userStoreLowdb } from './userStore.lowdb'
import { initLowdb, db } from './lowdb'

async function resetDb() {
  await initLowdb()
  db.data!.users = []
  db.data!._meta.lastId = 0
  await db.write()
}

describe('userStoreLowdb', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('creates and lists users with pagination and filtering', async () => {
    const u1 = await userStoreLowdb.create({ email: 'a@example.com', name: 'Alice' })
    const u2 = await userStoreLowdb.create({ email: 'b@example.com', name: 'Bob' })
    const u3 = await userStoreLowdb.create({ email: 'c@example.com', name: 'Carol' })

    expect(u1.id).toBeTypeOf('number')
    expect(u1.email).toBe('a@example.com')

    const page1 = await userStoreLowdb.list({ page: 1, pageSize: 2, orderBy: 'id', orderDir: 'asc' })
    expect(page1.data.length).toBe(2)
    expect(page1.total).toBe(3)

    const page2 = await userStoreLowdb.list({ page: 2, pageSize: 2, orderBy: 'id', orderDir: 'asc' })
    expect(page2.data.length).toBe(1)

    const filtered = await userStoreLowdb.list({ filter: { q: 'bob' } })
    expect(filtered.total).toBe(1)
    expect(filtered.data[0].name).toBe('Bob')
  })

  it('get/update/remove by id', async () => {
    const u = await userStoreLowdb.create({ email: 'x@example.com', name: 'X' })
    const fetched = await userStoreLowdb.getById(u.id)
    expect(fetched?.email).toBe('x@example.com')

    const updated = await userStoreLowdb.update(u.id, { name: 'Xavier' })
    expect(updated?.name).toBe('Xavier')

    const removed = await userStoreLowdb.remove(u.id)
    expect(removed).toBe(true)

    const missing = await userStoreLowdb.getById(u.id)
    expect(missing).toBeNull()
  })
})
