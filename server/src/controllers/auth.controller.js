import { authenticateUser, getCurrentUser, registerUser } from '../services/auth.service.js'

const COOKIE_NAME = 'applypilot_session'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

function cookieOptions(isProduction) {
  return [
    'HttpOnly',
    'Path=/',
    isProduction ? 'SameSite=None' : 'SameSite=Lax',
    `Max-Age=${Math.floor(ONE_WEEK_MS / 1000)}`,
    ...(isProduction ? ['Secure'] : []),
  ].join('; ')
}

function setSessionCookie(res, token, isProduction) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieOptions(isProduction)}`)
}

export async function register(req, res) {
  const result = await registerUser(req.body ?? {})
  setSessionCookie(res, result.token, process.env.NODE_ENV === 'production')
  res.status(201).json({ user: result.user })
}

export async function login(req, res) {
  const result = await authenticateUser(req.body ?? {})
  setSessionCookie(res, result.token, process.env.NODE_ENV === 'production')
  res.json({ user: result.user })
}

export function logout(req, res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=${sameSite}; Max-Age=0${secure}`)
  res.status(204).send()
}

export async function me(req, res) {
  res.json({ user: await getCurrentUser(req.userId) })
}
