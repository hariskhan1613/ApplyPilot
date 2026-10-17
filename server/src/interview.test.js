import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'
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
  await mongoose.connection.collection('interviewsessions').deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('interview prep API', () => {
  it('rejects unauthenticated generation', async () => {
    const response = await request(app).post('/api/interview/generate').send({ role: 'Software Engineer', category: 'Technical' })
    expect(response.status).toBe(401)
    expect(response.body.code).toBe('UNAUTHORIZED')
  })

  it('validates role and category before calling the provider', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/register').send({ name: 'Candidate', email: 'prep@example.com', password: 'correct horse battery staple' })
    const invalidRole = await agent.post('/api/interview/generate').send({ role: 'x', category: 'Technical' })
    const invalidCategory = await agent.post('/api/interview/generate').send({ role: 'Engineer', category: 'Unknown' })

    expect(invalidRole.status).toBe(400)
    expect(invalidRole.body.code).toBe('INVALID_ROLE')
    expect(invalidCategory.status).toBe(400)
    expect(invalidCategory.body.code).toBe('INVALID_CATEGORY')
  })

  it('reports missing provider configuration instead of creating fake questions', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/register').send({ name: 'Candidate', email: 'no-ai@example.com', password: 'correct horse battery staple' })
    const response = await agent.post('/api/interview/generate').send({ role: 'Software Engineer', category: 'Technical' })

    expect(response.status).toBe(503)
    expect(response.body.code).toBe('AI_NOT_CONFIGURED')
    expect(await agent.get('/api/interview/sessions')).toMatchObject({ status: 200, body: { sessions: [] } })
  })

  it('saves notes and practiced state and keeps sessions owner-scoped', async () => {
    process.env.LLM_API_KEY = 'test-provider-key'
    process.env.LLM_MODEL = 'test-model'
    const provider = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: JSON.stringify({
          questions: [
            { question: 'Describe a project you are proud of.' },
            { question: 'How do you debug a difficult issue?' },
            { question: 'How do you collaborate with teammates?' },
          ],
        }) }] } }],
      }),
    })
    const owner = request.agent(app)
    const other = request.agent(app)
    await owner.post('/api/auth/register').send({ name: 'Owner', email: 'owner-prep@example.com', password: 'correct horse battery staple' })
    await other.post('/api/auth/register').send({ name: 'Other', email: 'other-prep@example.com', password: 'correct horse battery staple' })

    const generated = await owner.post('/api/interview/generate').send({ role: 'Software Engineer', category: 'Technical' })
    const session = generated.body.session
    session.questions[0].notes = 'Use the STAR structure.'
    session.questions[0].practiced = true
    const updated = await owner.patch(`/api/interview/sessions/${session._id}`).send({ questions: session.questions })
    const reloaded = await owner.get('/api/interview/sessions')
    const forbidden = await other.patch(`/api/interview/sessions/${session._id}`).send({ questions: session.questions })

    expect(updated.status).toBe(200)
    expect(reloaded.body.sessions[0].questions[0].notes).toBe('Use the STAR structure.')
    expect(reloaded.body.sessions[0].questions[0].practiced).toBe(true)
    expect(forbidden.status).toBe(404)
    provider.mockRestore()
    process.env.LLM_API_KEY = ''
    process.env.LLM_MODEL = ''
  })
})
