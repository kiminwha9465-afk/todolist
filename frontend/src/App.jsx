import { useCallback, useEffect, useState } from 'react'
import { createTodo, deleteTodo, getTodos, toggleComplete, updateTodo } from './api/todoApi'
import TodoCalendar from './components/TodoCalendar'
import TodoDateGroup from './components/TodoDateGroup'
import TodoDetail from './components/TodoDetail'
import TodoForm from './components/TodoForm'

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'WORK', label: '업무' },
  { value: 'PERSONAL', label: '개인' },
  { value: 'STUDY', label: '학습' },
  { value: 'OTHER', label: '기타' }
]

export default function App() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState({ category: '', completed: '' })
  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [editingTodo, setEditingTodo] = useState(null)
  const [detailTodo, setDetailTodo] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: 0, size: 200, sort: 'deadline,asc' }
      if (filter.category) params.category = filter.category
      if (filter.completed !== '') params.completed = filter.completed
      const res = await getTodos(params)
      setTodos(res.data.content)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchTodos() }, [fetchTodos])

  const handleCreate = async (data) => {
    try {
      await createTodo(data)
      setShowForm(false)
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
      if (detailTodo?.id === id) setDetailTodo(null)
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
    setFilter(p => ({ ...p, [key]: p[key] === value && value !== '' ? '' : value }))
  }

  const openCreate  = ()     => { setEditingTodo(null); setShowForm(true) }
  const openEdit    = (todo) => { setEditingTodo(todo); setShowForm(false) }
  const closeForm   = ()     => { setShowForm(false); setEditingTodo(null) }
  const openDetail  = (todo) => setDetailTodo(todo)
  const closeDetail = ()     => setDetailTodo(null)

  const commonProps = {
    todos,
    onEdit:   openEdit,
    onDelete: handleDelete,
    onToggle: handleToggle,
    onDetail: openDetail,
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>TodoList</h1>
        <button className="btn primary" onClick={openCreate}>+ 새 할일</button>
      </header>

      {/* View toggle */}
      <div className="view-toggle">
        <button
          className={`view-btn${viewMode === 'list' ? ' active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          목록 보기
        </button>
        <button
          className={`view-btn${viewMode === 'calendar' ? ' active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          달력 보기
        </button>
      </div>

      {/* Filters */}
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

      {loading
        ? <div className="empty">로딩 중...</div>
        : viewMode === 'list'
          ? <TodoDateGroup {...commonProps} />
          : <TodoCalendar  {...commonProps} />
      }

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
