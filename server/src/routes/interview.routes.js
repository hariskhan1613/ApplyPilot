import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate } from '../middleware/authenticate.js'
import { generate, list, update } from '../controllers/interview.controller.js'

const router = Router()
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { message: 'Too many interview generation requests. Try again later.', code: 'AI_RATE_LIMITED' } })
router.use(authenticate)
router.post('/generate', aiLimiter, generate)
router.get('/sessions', list)
router.patch('/sessions/:id', update)
export default router
