import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from './app.js'
import { User } from './models/User.js'

let mongoServer

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-only-secret-with-sufficient-length'
  process.env.LLM_API_KEY = ''
  process.env.LLM_MODEL = ''
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

beforeEach(async () => {
  await User.deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('resume analysis upload', () => {
  it('rejects a non-PDF upload', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/register').send({
      name: 'Candidate',
      email: 'resume@example.com',
      password: 'correct horse battery staple',
    })

    const response = await agent
      .post('/api/resume/analyze')
      .field('jobDescription', 'A software engineering role requiring JavaScript experience.')
      .attach('resume', Buffer.from('not a PDF'), 'resume.txt')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('INVALID_FILE')
  })

  it('rejects missing resume files explicitly', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/register').send({
      name: 'Candidate',
      email: 'missing@example.com',
      password: 'correct horse battery staple',
    })

    const response = await agent
      .post('/api/resume/analyze')
      .field('jobDescription', 'A software engineering role requiring JavaScript experience.')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('RESUME_REQUIRED')
  })
})
