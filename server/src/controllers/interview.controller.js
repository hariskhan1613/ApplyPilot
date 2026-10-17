import { generateSession, listSessions, updateSession } from '../services/interview.service.js'

export async function generate(req, res) {
  const session = await generateSession(req.userId, req.body ?? {})
  res.status(201).json({ session })
}

export async function list(req, res) {
  res.json({ sessions: await listSessions(req.userId) })
}

export async function update(req, res) {
  res.json({ session: await updateSession(req.userId, req.params.id, req.body ?? {}) })
}
