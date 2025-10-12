import { BaseStore, Id, ListOptions, ListResult, makeValidator } from './baseStore'
import { userCreateSchema, userIdSchema, userSchema } from './schemas'
import { connectMongo } from './mongo'
import { UserModel, type UserDoc } from './mongoUserModel'
import mongoose from 'mongoose'

export interface CreateUserInput {
  email: string
  name: string
}

const validateCreate = makeValidator<CreateUserInput>(userCreateSchema)
type UserDTO = { id: string; email: string; name: string; createdAt: Date; updatedAt: Date }
const validateOutput = makeValidator<UserDTO>(userSchema)
const validateId = makeValidator<string | number>(userIdSchema)

export const userStoreMongo: BaseStore<UserDTO, CreateUserInput, Partial<CreateUserInput>, { q?: string }> = {
  async list(opts?: ListOptions<{ q?: string }>): Promise<ListResult<UserDTO>> {
    await connectMongo()
    const page = Math.max(1, opts?.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 20))
    const orderBy = opts?.orderBy ?? 'createdAt'
    const orderDir = (opts?.orderDir ?? 'asc').toLowerCase() as 'asc' | 'desc'
    const q = opts?.filter?.q?.trim()

    const filter: any = {}
    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ]
    }

    const total = await UserModel.countDocuments(filter)
    const rows: UserDoc[] = await UserModel.find(filter)
      .sort({ [orderBy]: orderDir === 'asc' ? 1 : -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<UserDoc[]>()
      .exec()

    const data = rows.map((r) =>
      validateOutput({
        id: (r._id as unknown as string) ?? '',
        email: r.email,
        name: r.name,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })
    )

    return { data, page, pageSize, total }
  },

  async getById(id: Id) {
    await connectMongo()
    const safeId = validateId(id)
    const oid = typeof safeId === 'string' && mongoose.Types.ObjectId.isValid(safeId) ? new mongoose.Types.ObjectId(safeId) : safeId
    const row = typeof oid === 'number' ? await UserModel.findOne({ legacyId: oid }).lean<UserDoc>() : await UserModel.findById(oid).lean<UserDoc>()
    if (!row) return null
    return validateOutput({
      id: (row._id as unknown as string) ?? '',
      email: row.email,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  },

  async create(input: CreateUserInput) {
    await connectMongo()
    const safe = validateCreate(input)
    const created = await UserModel.create(safe)
    const r = await created.toObject()
    return validateOutput({
      id: (r._id as unknown as string) ?? '',
      email: r.email,
      name: r.name,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })
  },

  async update(id: Id, patch: Partial<CreateUserInput>) {
    await connectMongo()
    const safeId = validateId(id)
    const oid = typeof safeId === 'string' && mongoose.Types.ObjectId.isValid(safeId) ? new mongoose.Types.ObjectId(safeId) : safeId
    const updated = typeof oid === 'number'
      ? await UserModel.findOneAndUpdate({ legacyId: oid }, { $set: patch }, { new: true }).lean<UserDoc | null>()
      : await UserModel.findByIdAndUpdate(oid as mongoose.Types.ObjectId, { $set: patch }, { new: true }).lean<UserDoc | null>()

    if (!updated) return null
    return validateOutput({
      id: (updated as any)._id?.toString() ?? '',
      email: updated.email,
      name: updated.name,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    })
  },

  async remove(id: Id) {
    await connectMongo()
    const safeId = validateId(id)
    const oid = typeof safeId === 'string' && mongoose.Types.ObjectId.isValid(safeId) ? new mongoose.Types.ObjectId(safeId) : safeId
    const res = typeof oid === 'number'
      ? await UserModel.deleteOne({ legacyId: oid })
      : await UserModel.findByIdAndDelete(oid as mongoose.Types.ObjectId)
    const ok = !!(res && ('deletedCount' in res ? res.deletedCount && res.deletedCount > 0 : res !== null))
    return ok
  },
}
