import { Router } from 'express'
import { ping } from '../controllers/healthController'
import { asyncHandler } from '../middlewares/asyncHandler'
import { getUsers, postUser } from '../controllers/usersController'
import { deleteUser, getUserById, patchUser } from '../controllers/usersIdController'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ ok: true })
})

router.get('/ping', ping)

router.get('/users', asyncHandler(getUsers))
router.post('/users', asyncHandler(postUser))
router.get('/users/:id', asyncHandler(getUserById))
router.patch('/users/:id', asyncHandler(patchUser))
router.delete('/users/:id', asyncHandler(deleteUser))

export default router
