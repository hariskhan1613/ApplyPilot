export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found', code: 'NOT_FOUND' })
}

export function errorHandler(error, req, res, next) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500
  if (statusCode >= 500) console.error(error)
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error' : error.message,
    code: error.code ?? 'INTERNAL_ERROR',
  })
}
