import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from './app.js'

describe('health endpoint', () => {
  it('reports that the API is available', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok', service: 'applypilot-api' })
  })
})

describe('unknown routes', () => {
  it('returns a safe JSON not-found response', async () => {
    const response = await request(app).get('/api/missing')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ message: 'Route not found', code: 'NOT_FOUND' })
  })
})
