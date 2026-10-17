import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { create, detail, list, remove, update } from '../controllers/application.controller.js'

const router = Router()
router.use(authenticate)
router.route('/').get(list).post(create)
router.route('/:id').get(detail).patch(update).delete(remove)

export default router
