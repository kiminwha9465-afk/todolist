import { useCallback, useEffect, useState } from 'react'
import { createTodo, deleteTodo, getTodos, toggleComplete, updateTodo } from './api/todoApi'
import TodoDetail from './components/TodoDetail'
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
  const [detailTodo, setDetailTodo] = useState(null)
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
    try {
      await createTodo(data)
      setShowForm(false)
      setCurrentPage(0)
      fetchTodos()
    } catch (e) {
      alert('등록 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  const handleUpdate = async (data) => {
    try {
      await updateTodo(editingTodo.id, data)
      setEditingTodo(null)
      fetchTodos()
    } catch (e) {
      alert('수정 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return
    try {
      await deleteTodo(id)
      fetchTodos()
    } catch (e) {
      alert('삭제 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  const handleToggle = async (id) => {
    try {
      await toggleComplete(id)
      fetchTodos()
    } catch (e) {
      alert('상태 변경 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  const handleFilterChange = (key, value) => {
    setFilter((p) => ({ ...p, [key]: value }))
    setCurrentPage(0)
  }

  const openCreate = () => { setEditingTodo(null); setShowForm(true) }
  const openEdit = (todo) => { setEditingTodo(todo); setShowForm(false) }
  const closeForm = () => { setShowForm(false); setEditingTodo(null) }
  const openDetail = (todo) => setDetailTodo(todo)
  const closeDetail = () => setDetailTodo(null)

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
        onDetail={openDetail}
      />

      {detailTodo && (
        <TodoDetail
          todo={detailTodo}
          onClose={closeDetail}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggle={async (id) => { await handleToggle(id); setDetailTodo(null) }}
        />
      )}

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
