import Joi from 'joi'

export type Id = number | string

export type ListOptions<TFilter = Record<string, unknown>> = {
  page?: number
  pageSize?: number
  orderBy?: string
  orderDir?: 'asc' | 'desc'
  filter?: TFilter
}

export type ListResult<T> = {
  data: T[]
  page: number
  pageSize: number
  total: number
}

export interface BaseStore<TOut, TCreate, TUpdate = Partial<TCreate>, TFilter = Record<string, unknown>> {
  list(opts?: ListOptions<TFilter>): Promise<ListResult<TOut>>
  getById(id: Id): Promise<TOut | null>
  create(input: TCreate): Promise<TOut>
  update(id: Id, patch: TUpdate): Promise<TOut | null>
  remove(id: Id): Promise<boolean>
}

export function makeValidator<T>(schema: Joi.Schema) {
  return (value: unknown, statusOnError = 400): T => {
    const { value: v, error } = schema.validate(value, { abortEarly: false, stripUnknown: true, convert: true })
    if (error) {
      const message = error.details.map((d) => d.message).join('; ')
      const err = new Error(message) as Error & { status?: number }
      err.status = statusOnError
      throw err
    }
    return v as T
  }
}
