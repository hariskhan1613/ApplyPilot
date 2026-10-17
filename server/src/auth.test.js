import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from './app.js'
import { User } from './models/User.js'

let mongoServer

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-only-secret-with-sufficient-length'
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

describe('authentication', () => {
  it('registers a user, normalizes email, and sets an HttpOnly cookie', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Candidate',
      email: '  Candidate@Example.com ',
      password: 'correct horse battery staple',
    })

    expect(response.status).toBe(201)
    expect(response.body.user.email).toBe('candidate@example.com')
    expect(response.body.user).not.toHaveProperty('passwordHash')
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly')
  })

  it('rejects duplicate emails and invalid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Candidate',
      email: 'candidate@example.com',
      password: 'correct horse battery staple',
    })

    const duplicate = await request(app).post('/api/auth/register').send({
      name: 'Other Candidate',
      email: 'CANDIDATE@example.com',
      password: 'correct horse battery staple',
    })
    const invalid = await request(app).post('/api/auth/login').send({
      email: 'candidate@example.com',
      password: 'wrong password',
    })

    expect(duplicate.status).toBe(409)
    expect(duplicate.body.code).toBe('EMAIL_IN_USE')
    expect(invalid.status).toBe(401)
    expect(invalid.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('supports me and logout through the session cookie', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/register').send({
      name: 'Candidate',
      email: 'candidate@example.com',
      password: 'correct horse battery staple',
    })

    const currentUser = await agent.get('/api/auth/me')
    const logout = await agent.post('/api/auth/logout')
    const afterLogout = await agent.get('/api/auth/me')

    expect(currentUser.status).toBe(200)
    expect(currentUser.body.user.email).toBe('candidate@example.com')
    expect(logout.status).toBe(204)
    expect(afterLogout.status).toBe(401)
  })

  it('rejects unauthenticated access to the current-user endpoint', async () => {
    const response = await request(app).get('/api/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.code).toBe('UNAUTHORIZED')
  })

  it('rejects unauthenticated resume analysis before processing an upload', async () => {
    const response = await request(app)
      .post('/api/resume/analyze')
      .field('jobDescription', 'A software engineering role requiring JavaScript experience.')

    expect(response.status).toBe(401)
    expect(response.body.code).toBe('UNAUTHORIZED')
  })
})
