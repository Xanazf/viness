import { User } from '../db/models'
import { BaseStore, Id, ListOptions, ListResult, makeValidator } from './baseStore'
import { userCreateSchema, userSchema, userIdSchema } from './schemas'
import { Op } from 'sequelize'

export interface CreateUserInput {
  email: string
  name: string
}

const validateCreate = makeValidator<CreateUserInput>(userCreateSchema)
const validateOutput = makeValidator<UserDTO>(userSchema)
const validateId = makeValidator<number>(userIdSchema)

type UserDTO = { id: number; email: string; name: string; createdAt: Date; updatedAt: Date }
function toUserDTO(row: unknown): UserDTO {
  return validateOutput(row)
}

export const userStore: BaseStore<UserDTO, CreateUserInput, Partial<CreateUserInput>, { q?: string }> = {
  async list(opts?: ListOptions<{ q?: string }>): Promise<ListResult<UserDTO>> {
    const page = Math.max(1, opts?.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 20))
    const orderBy = opts?.orderBy ?? 'id'
    const orderDir = (opts?.orderDir ?? 'asc').toUpperCase() as 'ASC' | 'DESC'
    const q = opts?.filter?.q?.trim()

    const where: any = {}
    if (q) {
      where[Op.or] = [
        { email: { [Op.like]: `%${q}%` } },
        { name: { [Op.like]: `%${q}%` } },
      ]
    }

    const { count: total, rows } = await User.findAndCountAll({
      where,
      order: [[orderBy as any, orderDir]],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    })
    const data = rows.map((r) => toUserDTO(r.toJSON()))
    return { data, page, pageSize, total }
  },

  async getById(id: Id) {
    const safeId = validateId(id)
    const row = await User.findByPk(safeId)
    return row ? toUserDTO(row.toJSON()) : null
  },

  async create(input: CreateUserInput) {
    const safeInput = validateCreate(input)
    const created = await User.create(safeInput)
    return toUserDTO(created.toJSON())
  },

  async update(id: Id, patch: Partial<CreateUserInput>) {
    const safeId = validateId(id)
    // For partial updates, we can allow unknowns to be stripped; reuse create schema as a base
    const validatePatch = makeValidator<Partial<CreateUserInput>>(userCreateSchema.fork(Object.keys(userCreateSchema.describe().keys ?? {}), (s) => s.optional()))
    const safePatch = validatePatch(patch)

    const row = await User.findByPk(safeId)
    if (!row) return null
    await row.update(safePatch)
    return toUserDTO(row.toJSON())
  },

  async remove(id: Id) {
    const safeId = validateId(id)
    const deleted = await User.destroy({ where: { id: safeId } })
    return deleted > 0
  },
}
