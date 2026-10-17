import {
  createApplication,
  deleteApplication,
  getApplication,
  getDashboardSummary,
  listApplications,
  updateApplication,
} from '../services/application.service.js'

export async function create(req, res) {
  res.status(201).json({ application: await createApplication(req.userId, req.body) })
}

export async function list(req, res) {
  res.json({ applications: await listApplications(req.userId, req.query) })
}

export async function detail(req, res) {
  res.json({ application: await getApplication(req.userId, req.params.id) })
}

export async function update(req, res) {
  res.json({ application: await updateApplication(req.userId, req.params.id, req.body) })
}

export async function remove(req, res) {
  await deleteApplication(req.userId, req.params.id)
  res.status(204).send()
}

export async function dashboard(req, res) {
  res.json({ summary: await getDashboardSummary(req.userId) })
}
