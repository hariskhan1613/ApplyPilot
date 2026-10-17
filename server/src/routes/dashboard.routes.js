import { Router } from 'express'
import { dashboard } from '../controllers/application.controller.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()
router.use(authenticate)
router.get('/summary', dashboard)

export default router
