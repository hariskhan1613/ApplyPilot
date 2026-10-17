import mongoose from 'mongoose'
import { Application, APPLICATION_STATUSES } from '../models/Application.js'
import { ApiError } from '../utils/ApiError.js'

const SORT_FIELDS = new Set(['appliedAt', 'updatedAt'])
const OPTIONAL_STRING_FIELDS = ['jobUrl', 'location', 'workMode', 'notes']

function ownerId(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED')
  }
  return new mongoose.Types.ObjectId(userId)
}

function cleanString(value, field, maxLength) {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.trim().length > maxLength) {
    throw new ApiError(400, `${field} must be a string of at most ${maxLength} characters`, 'INVALID_INPUT')
  }
  return value.trim()
}

function parseDate(value, field) {
  if (value === undefined || value === null || value === '') return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new ApiError(400, `${field} must be a valid date`, 'INVALID_DATE')
  return date
}

function parseNumber(value, field) {
  if (value === undefined || value === null || value === '') return undefined
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) {
    throw new ApiError(400, `${field} must be a non-negative number`, 'INVALID_SALARY')
  }
  return number
}

function validatePayload(body, partial = false) {
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body : {}
  const data = {}

  if (!partial || input.companyName !== undefined) {
    const companyName = cleanString(input.companyName, 'companyName', 120)
    if (!companyName) throw new ApiError(400, 'companyName is required', 'INVALID_INPUT')
    data.companyName = companyName
  }
  if (!partial || input.jobTitle !== undefined) {
    const jobTitle = cleanString(input.jobTitle, 'jobTitle', 160)
    if (!jobTitle) throw new ApiError(400, 'jobTitle is required', 'INVALID_INPUT')
    data.jobTitle = jobTitle
  }

  for (const field of OPTIONAL_STRING_FIELDS) {
    if (input[field] !== undefined) data[field] = cleanString(input[field], field, field === 'notes' ? 10000 : field === 'jobUrl' ? 2048 : field === 'workMode' ? 40 : 120)
  }
  if (data.jobUrl !== undefined && data.jobUrl !== '') {
    try {
      const url = new URL(data.jobUrl)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      throw new ApiError(400, 'jobUrl must be a valid HTTP or HTTPS URL', 'INVALID_URL')
    }
  }

  if (!partial || input.status !== undefined) {
    const status = input.status ?? 'Applied'
    if (!APPLICATION_STATUSES.includes(status)) {
      throw new ApiError(400, `status must be one of: ${APPLICATION_STATUSES.join(', ')}`, 'INVALID_STATUS')
    }
    data.status = status
  }
  for (const field of ['appliedAt', 'followUpAt']) {
    if (!partial || input[field] !== undefined) data[field] = parseDate(input[field], field)
  }
  for (const field of ['salaryMin', 'salaryMax']) {
    if (!partial || input[field] !== undefined) data[field] = parseNumber(input[field], field)
  }
  if (data.salaryMin !== undefined && data.salaryMax !== undefined && data.salaryMin > data.salaryMax) {
    throw new ApiError(400, 'salaryMin cannot be greater than salaryMax', 'INVALID_SALARY_RANGE')
  }
  return data
}

function findOwnedApplication(userId, applicationId) {
  if (!mongoose.isValidObjectId(applicationId)) {
    throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND')
  }
  return Application.findOne({ _id: applicationId, userId: ownerId(userId) })
}

export async function createApplication(userId, body) {
  const data = validatePayload(body)
  const application = await Application.create({ ...data, userId: ownerId(userId) })
  return application.toObject()
}

export async function listApplications(userId, query) {
  const filter = { userId: ownerId(userId) }
  if (query.status) {
    if (!APPLICATION_STATUSES.includes(query.status)) throw new ApiError(400, 'Invalid status filter', 'INVALID_STATUS')
    filter.status = query.status
  }
  if (query.search) {
    const search = String(query.search).trim()
    if (search.length > 100) throw new ApiError(400, 'Search is too long', 'INVALID_SEARCH')
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [{ companyName: { $regex: escaped, $options: 'i' } }, { jobTitle: { $regex: escaped, $options: 'i' } }]
  }
  const sortField = SORT_FIELDS.has(query.sort) ? query.sort : 'updatedAt'
  const direction = query.direction === 'asc' ? 1 : -1
  return Application.find(filter).sort({ [sortField]: direction, _id: -1 }).limit(100).lean()
}

export async function getApplication(userId, applicationId) {
  const application = await findOwnedApplication(userId, applicationId)
  if (!application) throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND')
  return application.toObject()
}

export async function updateApplication(userId, applicationId, body) {
  const application = await findOwnedApplication(userId, applicationId)
  if (!application) throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND')
  const data = validatePayload(body, true)
  if (data.status && data.status !== application.status) {
    application.statusHistory.push({ status: data.status, changedAt: new Date() })
  }
  Object.assign(application, data)
  await application.save()
  return application.toObject()
}

export async function deleteApplication(userId, applicationId) {
  const application = await findOwnedApplication(userId, applicationId)
  if (!application) throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND')
  await application.deleteOne()
}

export async function getDashboardSummary(userId) {
  const owner = ownerId(userId)
  const [statusCounts, recentApplications, upcomingFollowUps, total] = await Promise.all([
    Application.aggregate([
      { $match: { userId: owner } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.find({ userId: owner }).sort({ updatedAt: -1 }).limit(5).lean(),
    Application.find({ userId: owner, followUpAt: { $gte: new Date() } }).sort({ followUpAt: 1 }).limit(5).lean(),
    Application.countDocuments({ userId: owner }),
  ])
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, 0]))
  for (const item of statusCounts) counts[item._id] = item.count
  return { total, counts, recentApplications, upcomingFollowUps }
}
