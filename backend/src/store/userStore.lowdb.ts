import { BaseStore, Id, ListOptions, ListResult, makeValidator } from './baseStore'
import { db, initLowdb } from './lowdb'
import { userCreateSchema, userIdSchema, userSchema } from './schemas'

export interface CreateUserInput {
  email: string
  name: string
}

const validateCreate = makeValidator<CreateUserInput>(userCreateSchema)
type UserDTO = { id: number; email: string; name: string; createdAt: string; updatedAt: string }
const validateOutput = makeValidator<UserDTO>(userSchema)
const validateId = makeValidator<number>(userIdSchema)

function nowISO() {
  return new Date().toISOString()
}

export const userStoreLowdb: BaseStore<UserDTO, CreateUserInput, Partial<CreateUserInput>, { q?: string }> = {
  async list(opts?: ListOptions<{ q?: string }>): Promise<ListResult<UserDTO>> {
    await initLowdb()
    const page = Math.max(1, opts?.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 20))
    const orderBy = opts?.orderBy ?? 'id'
    const orderDir = (opts?.orderDir ?? 'asc').toLowerCase() as 'asc' | 'desc'
    const q = opts?.filter?.q?.trim()

    let rows = db.data!.users.slice()
    if (q) {
      const like = (s: string) => s.toLowerCase().includes(q.toLowerCase())
      rows = rows.filter((u) => like(u.email) || like(u.name))
    }
    rows.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const av = a[orderBy] as any
      const bv = b[orderBy] as any
      if (av < bv) return orderDir === 'asc' ? -1 : 1
      if (av > bv) return orderDir === 'asc' ? 1 : -1
      return 0
    })
    const total = rows.length
    const paged = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
    const data = paged.map((r) => validateOutput(r))
    return { data, page, pageSize, total }
  },

  async getById(id: Id) {
    await initLowdb()
    const safeId = validateId(id)
    const row = db.data!.users.find((u) => u.id === safeId)
    return row ? validateOutput(row) : null
  },

  async create(input: CreateUserInput) {
    await initLowdb()
    const safe = validateCreate(input)
    const id = ++db.data!._meta.lastId
    const row = { id, ...safe, createdAt: nowISO(), updatedAt: nowISO() }
    db.data!.users.push(row)
    await db.write()
    return validateOutput(row)
  },

  async update(id: Id, patch: Partial<CreateUserInput>) {
    await initLowdb()
    const safeId = validateId(id)
    const idx = db.data!.users.findIndex((u) => u.id === safeId)
    if (idx === -1) return null
    const current = db.data!.users[idx]
    const next = { ...current, ...patch, updatedAt: nowISO() }
    db.data!.users[idx] = next
    await db.write()
    return validateOutput(next)
  },

  async remove(id: Id) {
    await initLowdb()
    const safeId = validateId(id)
    const before = db.data!.users.length
    db.data!.users = db.data!.users.filter((u) => u.id !== safeId)
    const after = db.data!.users.length
    const changed = before !== after
    if (changed) await db.write()
    return changed
  },
}
