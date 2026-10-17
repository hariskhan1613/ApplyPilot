import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Application } from './Application.js'
import { InterviewSession } from './InterviewSession.js'
import { User } from './User.js'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('application persistence', () => {
  it('writes and reads an owner-scoped application with initial status history', async () => {
    const user = await User.create({
      name: 'Test Candidate',
      email: 'candidate@example.com',
      passwordHash: 'hashed-password',
    })

    const application = await Application.create({
      userId: user._id,
      companyName: 'Example Labs',
      jobTitle: 'Software Engineer',
      status: 'Applied',
    })

    const saved = await Application.findOne({ _id: application._id, userId: user._id }).lean()

    expect(saved.companyName).toBe('Example Labs')
    expect(saved.statusHistory).toHaveLength(1)
    expect(saved.statusHistory[0].status).toBe('Applied')
    expect(saved.createdAt).toBeInstanceOf(Date)
    expect(saved.updatedAt).toBeInstanceOf(Date)
  })
})

describe('schema constraints', () => {
  it('rejects unknown application statuses', async () => {
    const application = new Application({
      userId: new mongoose.Types.ObjectId(),
      companyName: 'Example Labs',
      jobTitle: 'Engineer',
      status: 'Unknown',
    })

    await expect(application.validate()).rejects.toThrow(/is not a valid enum value/)
  })

  it('rejects interview sessions with more than ten questions', async () => {
    const session = new InterviewSession({
      userId: new mongoose.Types.ObjectId(),
      role: 'Software Engineer',
      category: 'Technical',
      questions: Array.from({ length: 11 }, () => ({
        category: 'Technical',
        question: 'Explain a technical decision.',
      })),
    })

    await expect(session.validate()).rejects.toThrow(/between 1 and 10/)
  })
})
