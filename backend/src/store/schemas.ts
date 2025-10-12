import Joi from 'joi'

export const userIdSchema = Joi.number().integer().positive().required()

export const userCreateSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  name: Joi.string().trim().min(1).required(),
})

export const userSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required(),
}).required()

export type UserCreateInput = {
  email: string
  name: string
}
