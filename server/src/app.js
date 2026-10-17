import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { getEnv } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import applicationRoutes from './routes/application.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import interviewRoutes from './routes/interview.routes.js'

const env = getEnv()
const app = express()

app.use(helmet())
app.use(cors({ origin: env.clientOrigin, credentials: true }))
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'applypilot-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/interview', interviewRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
