import { useCallback, useEffect, useRef, useState } from 'react'
import { createTodo, deleteTodo, getTodos, pinTodo, toggleComplete, updateTodo } from './api/todoApi'
import AuthForm from './components/AuthForm'
import TodoCalendar from './components/TodoCalendar'
import TodoDateGroup from './components/TodoDateGroup'
import TodoDetail from './components/TodoDetail'
import TodoForm from './components/TodoForm'
import { useAuth } from './context/AuthContext'

const CATEGORIES = [
  { value: '',         label: '전체' },
  { value: 'WORK',     label: '업무' },
  { value: 'PERSONAL', label: '개인' },
  { value: 'STUDY',    label: '학습' },
  { value: 'OTHER',    label: '기타' },
]

const PAGE_SIZE = 20

export default function App() {
  const { user, logout } = useAuth()

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  if (!user) return <AuthForm />

  const [listTodos,   setListTodos]   = useState([])
  const [calTodos,    setCalTodos]    = useState([])
  const [hasMore,     setHasMore]     = useState(true)
  const [filter,      setFilter]      = useState({ category: '', completed: '', keyword: '' })
  const [searchInput, setSearchInput] = useState('')
  const [viewMode,    setViewMode]    = useState('list')
  const [loading,     setLoading]     = useState(false)
  const [editingTodo,      setEditingTodo]      = useState(null)
  const [detailTodo,       setDetailTodo]       = useState(null)
  const [showForm,         setShowForm]         = useState(false)
  const [selectedCalDate,  setSelectedCalDate]  = useState(null)

  const isLoadingRef = useRef(false)
  const hasMoreRef   = useRef(true)
  const pageRef      = useRef(0)
  const sentinelRef  = useRef(null)

  useEffect(() => { hasMoreRef.current = hasMore }, [hasMore])

  const fetchListPage = useCallback(async (pageNum, append) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setLoading(true)
    try {
      const params = { page: pageNum, size: PAGE_SIZE, sort: 'deadline,asc' }
      if (filter.category)        params.category  = filter.category
      if (filter.completed !== '') params.completed = filter.completed
      if (filter.keyword)         params.keyword   = filter.keyword
      const res = await getTodos(params)
      const { content, last } = res.data
      setListTodos(prev => append ? [...prev, ...content] : content)
      setHasMore(!last)
      pageRef.current = pageNum
    } finally {
      isLoadingRef.current = false
      setLoading(false)
    }
  }, [filter])

  const fetchCalTodos = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: 0, size: 200, sort: 'deadline,asc' }
      if (filter.category)        params.category  = filter.category
      if (filter.completed !== '') params.completed = filter.completed
      if (filter.keyword)         params.keyword   = filter.keyword
      const res = await getTodos(params)
      setCalTodos(res.data.content)
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Reset + initial fetch when filter or viewMode changes
  useEffect(() => {
    pageRef.current    = 0
    hasMoreRef.current = true
    if (viewMode === 'list') {
      setListTodos([])
      setHasMore(true)
      fetchListPage(0, false)
    } else {
      fetchCalTodos()
    }
  }, [viewMode, filter]) // fetchListPage/fetchCalTodos intentionally omitted to avoid double-fetch

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (viewMode !== 'list') return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
        fetchListPage(pageRef.current + 1, true)
      }
    }, { rootMargin: '0px 0px 200px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [viewMode, fetchListPage])

  const refresh = useCallback(() => {
    pageRef.current    = 0
    hasMoreRef.current = true
    if (viewMode === 'list') {
      setListTodos([])
      setHasMore(true)
      fetchListPage(0, false)
    } else {
      fetchCalTodos()
    }
  }, [viewMode, fetchListPage, fetchCalTodos])

  const handleCreate = async (data) => {
    try {
      await createTodo(data)
      setShowForm(false)
      refresh()
    } catch (e) {
      alert('등록 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  const handleUpdate = async (data) => {
    try {
      await updateTodo(editingTodo.id, data)
      setEditingTodo(null)
      refresh()
    } catch (e) {
      alert('수정 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return
    try {
      await deleteTodo(id)
      if (detailTodo?.id === id) setDetailTodo(null)
      refresh()
    } catch (e) {
      alert('삭제 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  const handleToggle = async (id) => {
    try {
      await toggleComplete(id)
      refresh()
    } catch (e) {
      alert('상태 변경 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  const handlePin = async (id) => {
    try {
      await pinTodo(id)
      refresh()
    } catch (e) {
      alert('고정 변경 실패: ' + (e.response?.data?.message ?? e.message))
    }
  }

  // 검색어 디바운스 (400ms)
  useEffect(() => {
    const t = setTimeout(() => setFilter(p => ({ ...p, keyword: searchInput })), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleFilterChange = (key, value) => {
    setFilter(p => ({ ...p, [key]: p[key] === value && value !== '' ? '' : value }))
  }

  const openCreate         = ()       => { setEditingTodo(null); setSelectedCalDate(null); setShowForm(true) }
  const openCreateWithDate = (date)   => { setEditingTodo(null); setSelectedCalDate(`${date}T00:00`); setShowForm(true) }
  const openEdit           = (todo)   => { setEditingTodo(todo); setSelectedCalDate(null); setShowForm(false) }
  const closeForm          = ()       => { setShowForm(false); setEditingTodo(null); setSelectedCalDate(null) }
  const openDetail  = (todo) => setDetailTodo(todo)
  const closeDetail = ()     => setDetailTodo(null)

  const commonProps = {
    onEdit:   openEdit,
    onDelete: handleDelete,
    onToggle: handleToggle,
    onDetail: openDetail,
    onPin:    handlePin,
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 style={{ cursor: 'pointer' }} onClick={() => {
          setViewMode('list')
          setFilter({ category: '', completed: '', keyword: '' })
          setSearchInput('')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}>TodoList</h1>
        <div className="header-right">
          <span className="username-badge">{user.username}</span>
          <button className="dark-toggle" onClick={() => setDarkMode(d => !d)} title={darkMode ? '라이트 모드' : '다크 모드'}>
            {darkMode ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button className="btn primary" onClick={openCreate}>+ 새 할일</button>
          <button className="btn secondary" onClick={logout}>로그아웃</button>
        </div>
      </header>

      <div className="view-toggle">
        <button className={`view-btn${viewMode === 'list'     ? ' active' : ''}`} onClick={() => setViewMode('list')}>목록 보기</button>
        <button className={`view-btn${viewMode === 'calendar' ? ' active' : ''}`} onClick={() => setViewMode('calendar')}>달력 보기</button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="search-input"
          placeholder="제목 또는 내용으로 검색"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button className="search-clear" onClick={() => setSearchInput('')} aria-label="검색어 지우기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          {CATEGORIES.map(({ value, label }) => (
            <button key={value}
              className={`filter-btn${filter.category === value ? ' active' : ''}`}
              onClick={() => handleFilterChange('category', value)}>{label}</button>
          ))}
        </div>
        <div className="filter-group">
          {[['', '전체'], ['false', '진행 중'], ['true', '완료']].map(([val, label]) => (
            <button key={val}
              className={`filter-btn${filter.completed === val ? ' active' : ''}`}
              onClick={() => handleFilterChange('completed', val)}>{label}</button>
          ))}
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          <TodoDateGroup todos={listTodos} loading={loading} {...commonProps} />
          <div ref={sentinelRef} />
          {loading && listTodos.length > 0 && <div className="load-spinner">불러오는 중...</div>}
          {!hasMore && listTodos.length > 0 && <div className="load-end">모든 할일을 불러왔습니다</div>}
        </>
      ) : (
        <>
          {loading && calTodos.length === 0
            ? <div className="empty">로딩 중...</div>
            : <TodoCalendar todos={calTodos} {...commonProps} onCreateWithDate={openCreateWithDate} />
          }
        </>
      )}

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
          defaultDeadline={selectedCalDate}
          onSubmit={editingTodo ? handleUpdate : handleCreate}
          onCancel={closeForm}
        />
      )}
    </div>
  )
}
