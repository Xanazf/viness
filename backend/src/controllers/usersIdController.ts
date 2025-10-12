import type { Request, Response } from 'express'
import { stores } from '../store'

export const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id
  const user = await stores.users.getById(id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
}

export const patchUser = async (req: Request, res: Response) => {
  const id = req.params.id
  const updated = await stores.users.update(id, req.body ?? {})
  if (!updated) return res.status(404).json({ error: 'User not found' })
  res.json(updated)
}

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id
  const ok = await stores.users.remove(id)
  if (!ok) return res.status(404).json({ error: 'User not found' })
  res.status(204).send()
}
