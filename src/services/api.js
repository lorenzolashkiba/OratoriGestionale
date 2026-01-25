import { getIdToken } from './firebase'

const API_BASE = '/api'

async function fetchWithAuth(url, options = {}) {
  const token = await getIdToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Errore sconosciuto' }))
    throw new Error(error.message || 'Errore nella richiesta')
  }

  return response.json()
}

// Users API
export const usersApi = {
  getProfile: () => fetchWithAuth('/users'),
  updateProfile: (data) => fetchWithAuth('/users', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
}

// Oratori API
export const oratoriApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.localita) params.append('localita', filters.localita)
    if (filters.nome) params.append('nome', filters.nome)
    if (filters.cognome) params.append('cognome', filters.cognome)
    if (filters.congregazione) params.append('congregazione', filters.congregazione)
    const query = params.toString()
    return fetchWithAuth(`/oratori${query ? `?${query}` : ''}`)
  },
  getById: (id) => fetchWithAuth(`/oratori?id=${id}`),
  create: (data) => fetchWithAuth('/oratori', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth('/oratori', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  }),
  delete: (id) => fetchWithAuth('/oratori', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  }),
}

// Programmi API
export const programmiApi = {
  getAll: () => fetchWithAuth('/programmi'),
  getAllOccupied: () => fetchWithAuth('/programmi?allOccupied=true'),
  getOccupiedDates: (oratoreId) => fetchWithAuth(`/programmi?oratoreId=${oratoreId}&occupiedOnly=true`),
  create: (data) => fetchWithAuth('/programmi', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth('/programmi', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  }),
  delete: (id) => fetchWithAuth('/programmi', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  }),
}

// Congregazioni API
export const congregazioniApi = {
  getAll: () => fetchWithAuth('/congregazioni'),
  getByNome: (nome) => fetchWithAuth(`/congregazioni?nome=${encodeURIComponent(nome)}`),
  create: (data) => fetchWithAuth('/congregazioni', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchWithAuth('/congregazioni', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  }),
  delete: (id) => fetchWithAuth('/congregazioni', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  }),
}

// Admin API
export const adminApi = {
  getPendingUsers: () => fetchWithAuth('/admin/pending'),
  getAllUsers: (filters = {}) => {
    const params = new URLSearchParams(filters)
    const query = params.toString()
    return fetchWithAuth(`/admin/users${query ? `?${query}` : ''}`)
  },
  getStats: () => fetchWithAuth('/admin/stats'),
  approveUser: (userId) => fetchWithAuth('/admin/approve', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
  rejectUser: (userId, reason) => fetchWithAuth('/admin/reject', {
    method: 'POST',
    body: JSON.stringify({ userId, reason }),
  }),
  changeRole: (userId, role) => fetchWithAuth('/admin/role', {
    method: 'PUT',
    body: JSON.stringify({ userId, role }),
  }),
  deleteUser: (userId) => fetchWithAuth('/admin/user', {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  }),
}
