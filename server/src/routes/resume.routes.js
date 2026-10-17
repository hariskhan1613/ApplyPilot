import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate } from '../middleware/authenticate.js'
import { uploadResume } from '../middleware/uploadResume.js'
import { analyze } from '../controllers/resume.controller.js'

const router = Router()
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { message: 'Too many analysis requests. Try again later.', code: 'AI_RATE_LIMITED' } })
router.post('/analyze', authenticate, aiLimiter, uploadResume, analyze)
export default router
