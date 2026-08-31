import { useCallback, useEffect, useState } from 'react'
import { createTodo, deleteTodo, getTodos, toggleComplete, updateTodo } from './api/todoApi'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'WORK', label: '업무' },
  { value: 'PERSONAL', label: '개인' },
  { value: 'STUDY', label: '학습' },
  { value: 'OTHER', label: '기타' }
]

export default function App() {
  const [todos, setTodos] = useState([])
  const [page, setPage] = useState({ number: 0, totalPages: 0, totalElements: 0 })
  const [currentPage, setCurrentPage] = useState(0)
  const [filter, setFilter] = useState({ category: '', completed: '' })
  const [editingTodo, setEditingTodo] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, size: 10 }
      if (filter.category) params.category = filter.category
      if (filter.completed !== '') params.completed = filter.completed
      const res = await getTodos(params)
      setTodos(res.data.content)
      setPage({
        number: res.data.number,
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, filter])

  useEffect(() => { fetchTodos() }, [fetchTodos])

  const handleCreate = async (data) => {
    await createTodo(data)
    setShowForm(false)
    setCurrentPage(0)
    fetchTodos()
  }

  const handleUpdate = async (data) => {
    await updateTodo(editingTodo.id, data)
    setEditingTodo(null)
    fetchTodos()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return
    await deleteTodo(id)
    fetchTodos()
  }

  const handleToggle = async (id) => {
    await toggleComplete(id)
    fetchTodos()
  }

  const handleFilterChange = (key, value) => {
    setFilter((p) => ({ ...p, [key]: value }))
    setCurrentPage(0)
  }

  const openCreate = () => { setEditingTodo(null); setShowForm(true) }
  const openEdit = (todo) => { setEditingTodo(todo); setShowForm(false) }
  const closeForm = () => { setShowForm(false); setEditingTodo(null) }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 TodoList</h1>
        <button className="btn primary" onClick={openCreate}>+ 새 할일</button>
      </header>

      <div className="filters">
        <div className="filter-group">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              className={`filter-btn${filter.category === value ? ' active' : ''}`}
              onClick={() => handleFilterChange('category', value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="filter-group">
          {[['', '전체'], ['false', '진행 중'], ['true', '완료']].map(([val, label]) => (
            <button
              key={val}
              className={`filter-btn${filter.completed === val ? ' active' : ''}`}
              onClick={() => handleFilterChange('completed', val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <TodoList
        todos={todos}
        loading={loading}
        page={page}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {(showForm || editingTodo) && (
        <TodoForm
          initial={editingTodo}
          onSubmit={editingTodo ? handleUpdate : handleCreate}
          onCancel={closeForm}
        />
      )}
    </div>
  )
}
