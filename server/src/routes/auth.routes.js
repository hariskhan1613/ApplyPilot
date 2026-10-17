import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, logout, me, register } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Try again later.', code: 'AUTH_RATE_LIMITED' },
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.get('/me', authenticate, me)

export default router
