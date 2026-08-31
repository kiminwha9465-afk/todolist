import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
})

export const getTodos = (params) => api.get('/todos', { params })
export const createTodo = (data) => api.post('/todos', data)
export const updateTodo = (id, data) => api.put(`/todos/${id}`, data)
export const deleteTodo = (id) => api.delete(`/todos/${id}`)
export const toggleComplete = (id) => api.patch(`/todos/${id}/complete`)
