import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from './app.js'
import { User } from './models/User.js'

let mongoServer

async function register(agent, email) {
  return agent.post('/api/auth/register').send({
    name: 'Candidate',
    email,
    password: 'correct horse battery staple',
  })
}

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-only-secret-with-sufficient-length'
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

beforeEach(async () => {
  await User.deleteMany({})
  await mongoose.connection.collection('applications').deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('application API', () => {
  it('creates, filters, updates with history, and deletes an application', async () => {
    const agent = request.agent(app)
    await register(agent, 'candidate@example.com')
    const created = await agent.post('/api/applications').send({
      companyName: 'Example Labs',
      jobTitle: 'Software Engineer',
      jobUrl: 'https://example.com/jobs/1',
      status: 'Applied',
      salaryMin: 90000,
      salaryMax: 120000,
    })

    expect(created.status).toBe(201)
    expect(created.body.application.statusHistory).toHaveLength(1)
    const id = created.body.application._id

    const filtered = await agent.get('/api/applications?search=example&status=Applied')
    const updated = await agent.patch(`/api/applications/${id}`).send({ status: 'Interview', notes: 'Panel next week' })
    const deleted = await agent.delete(`/api/applications/${id}`)

    expect(filtered.status).toBe(200)
    expect(filtered.body.applications).toHaveLength(1)
    expect(updated.body.application.statusHistory).toHaveLength(2)
    expect(updated.body.application.statusHistory[1].status).toBe('Interview')
    expect(deleted.status).toBe(204)
  })

  it('prevents one user from reading or deleting another user application', async () => {
    const owner = request.agent(app)
    const other = request.agent(app)
    await register(owner, 'owner@example.com')
    await register(other, 'other@example.com')
    const created = await owner.post('/api/applications').send({ companyName: 'Private Co', jobTitle: 'Engineer' })
    const id = created.body.application._id

    const read = await other.get(`/api/applications/${id}`)
    const deleted = await other.delete(`/api/applications/${id}`)

    expect(read.status).toBe(404)
    expect(deleted.status).toBe(404)
    expect((await owner.get(`/api/applications/${id}`)).status).toBe(200)
  })

  it('rejects invalid payloads and unauthenticated requests', async () => {
    const invalid = await request(app).post('/api/applications').send({
      companyName: 'Company',
      jobTitle: 'Role',
      jobUrl: 'javascript:alert(1)',
      salaryMin: 10,
      salaryMax: 5,
    })
    const unauthorized = await request(app).get('/api/applications')

    expect(invalid.status).toBe(401)
    expect(unauthorized.status).toBe(401)

    const agent = request.agent(app)
    await register(agent, 'validation@example.com')
    const response = await agent.post('/api/applications').send({
      companyName: 'Company',
      jobTitle: 'Role',
      jobUrl: 'javascript:alert(1)',
      salaryMin: 10,
      salaryMax: 5,
    })
    expect(response.status).toBe(400)
    expect(['INVALID_URL', 'INVALID_SALARY_RANGE']).toContain(response.body.code)
  })

  it('returns owner-scoped dashboard counts and recent data', async () => {
    const agent = request.agent(app)
    await register(agent, 'dashboard@example.com')
    await agent.post('/api/applications').send({ companyName: 'One', jobTitle: 'Role', status: 'Offer' })
    await agent.post('/api/applications').send({ companyName: 'Two', jobTitle: 'Role', status: 'Applied' })

    const response = await agent.get('/api/dashboard/summary')

    expect(response.status).toBe(200)
    expect(response.body.summary.total).toBe(2)
    expect(response.body.summary.counts.Offer).toBe(1)
    expect(response.body.summary.counts.Applied).toBe(1)
    expect(response.body.summary.recentApplications).toHaveLength(2)
  })

  it('supports every application status filter', async () => {
    const agent = request.agent(app)
    await register(agent, 'statuses@example.com')
    for (const status of ['Applied', 'In Review', 'Interview', 'Offer', 'Rejected']) {
      await agent.post('/api/applications').send({ companyName: `${status} Co`, jobTitle: 'Role', status })
    }

    for (const status of ['Applied', 'In Review', 'Interview', 'Offer', 'Rejected']) {
      const response = await agent.get(`/api/applications?status=${encodeURIComponent(status)}`)
      expect(response.status).toBe(200)
      expect(response.body.applications).toHaveLength(1)
      expect(response.body.applications[0].status).toBe(status)
    }
  })
})
