import type { Request, Response } from 'express'
import { listUsers, createUser } from '../services/userService'

export const getUsers = async (req: Request, res: Response) => {
  const { page, pageSize, orderBy, orderDir, q } = req.query as Record<string, string>
  const users = await listUsers({
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    orderBy,
    orderDir: orderDir as any,
    filter: { q },
  })
  res.json(users)
}

export const postUser = async (req: Request, res: Response) => {
  const { email, name } = req.body ?? {}
  if (!email || !name) {
    res.status(400).json({ error: 'email and name are required' })
    return
  }
  const user = await createUser({ email, name })
  res.status(201).json(user)
}
