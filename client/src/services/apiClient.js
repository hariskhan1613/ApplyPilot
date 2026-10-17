const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })

  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.message ?? 'Something went wrong')
    error.code = payload.code
    error.status = response.status
    throw error
  }
  return payload
}

export const authApi = {
  me: () => apiRequest('/auth/me'),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
}

export const applicationsApi = {
  list: (params = '') => apiRequest(`/applications${params ? `?${params}` : ''}`),
  get: (id) => apiRequest(`/applications/${id}`),
  create: (body) => apiRequest('/applications', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => apiRequest(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => apiRequest(`/applications/${id}`, { method: 'DELETE' }),
  dashboard: () => apiRequest('/dashboard/summary'),
}

export async function analyzeResume(formData) {
  return apiRequest('/resume/analyze', { method: 'POST', body: formData })
}

export const interviewApi = {
  generate: (body) => apiRequest('/interview/generate', { method: 'POST', body: JSON.stringify(body) }),
  sessions: () => apiRequest('/interview/sessions'),
  update: (id, body) => apiRequest(`/interview/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
}
