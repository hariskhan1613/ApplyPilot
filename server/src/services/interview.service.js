import mongoose from 'mongoose'
import { InterviewSession } from '../models/InterviewSession.js'
import { generateInterviewQuestions } from './ai.service.js'
import { ApiError } from '../utils/ApiError.js'

function ownerId(userId) {
  if (!mongoose.isValidObjectId(userId)) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED')
  return new mongoose.Types.ObjectId(userId)
}

export async function generateSession(userId, input) {
  const questions = await generateInterviewQuestions(input)
  return InterviewSession.create({ userId: ownerId(userId), role: input.role.trim(), category: input.category, questions: questions.questions })
}

export async function listSessions(userId) {
  return InterviewSession.find({ userId: ownerId(userId) }).sort({ updatedAt: -1 }).limit(30).lean()
}

export async function updateSession(userId, sessionId, input) {
  if (!mongoose.isValidObjectId(sessionId)) throw new ApiError(404, 'Interview session not found', 'SESSION_NOT_FOUND')
  if (!Array.isArray(input?.questions) || input.questions.length < 1 || input.questions.length > 10) {
    throw new ApiError(400, 'Questions must contain between 1 and 10 items', 'INVALID_QUESTIONS')
  }
  const cleanQuestions = input.questions.map((item) => ({
    _id: item._id,
    category: item.category,
    question: item.question,
    notes: item.notes ?? '',
    practiced: Boolean(item.practiced),
  }))
  if (cleanQuestions.some((item) => typeof item.question !== 'string' || item.question.trim().length < 5 || typeof item.notes !== 'string' || item.notes.length > 5000)) {
    throw new ApiError(400, 'Each question and note must be valid', 'INVALID_QUESTIONS')
  }
  const session = await InterviewSession.findOneAndUpdate(
    { _id: sessionId, userId: ownerId(userId) },
    { $set: { questions: cleanQuestions } },
    { returnDocument: 'after', runValidators: true },
  ).lean()
  if (!session) throw new ApiError(404, 'Interview session not found', 'SESSION_NOT_FOUND')
  return session
}
