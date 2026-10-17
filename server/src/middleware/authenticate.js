import { getCurrentUser, verifyToken } from '../services/auth.service.js'

function getCookieValue(header, name) {
  const cookie = header?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null
}

export async function authenticate(req, res, next) {
  try {
    const token = getCookieValue(req.headers.cookie, 'applypilot_session')
    if (!token) return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' })
    const payload = verifyToken(token)
    req.user = await getCurrentUser(payload.sub)
    req.userId = payload.sub
    return next()
  } catch (error) {
    return next(error)
  }
}
