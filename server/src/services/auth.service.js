import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { getEnv } from '../config/env.js'

const PASSWORD_MIN_LENGTH = 8
const SESSION_DAYS = 7

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    themePreference: user.themePreference,
  }
}

function createToken(userId) {
  const { jwtSecret } = getEnv()
  if (!jwtSecret) throw new Error('JWT_SECRET is required for authentication')
  return jwt.sign({ sub: userId.toString() }, jwtSecret, { expiresIn: `${SESSION_DAYS}d` })
}

export async function registerUser({ name, email, password }) {
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    throw new ApiError(400, 'Name must be between 2 and 80 characters', 'INVALID_NAME')
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new ApiError(400, 'A valid email is required', 'INVALID_EMAIL')
  }
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    throw new ApiError(400, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`, 'INVALID_PASSWORD')
  }

  const normalizedEmail = normalizeEmail(email)
  const existingUser = await User.findOne({ email: normalizedEmail }).select('_id').lean()
  if (existingUser) throw new ApiError(409, 'An account with that email already exists', 'EMAIL_IN_USE')

  const passwordHash = await bcrypt.hash(password, 12)
  try {
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash })
    return { user: publicUser(user), token: createToken(user._id) }
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, 'An account with that email already exists', 'EMAIL_IN_USE')
    throw error
  }
}

export async function authenticateUser({ email, password }) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
  }
  return { user: publicUser(user), token: createToken(user._id) }
}

export function verifyToken(token) {
  const { jwtSecret } = getEnv()
  if (!jwtSecret) throw new Error('JWT_SECRET is required for authentication')
  try {
    return jwt.verify(token, jwtSecret)
  } catch {
    throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED')
  }
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId).lean()
  if (!user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED')
  return publicUser(user)
}
