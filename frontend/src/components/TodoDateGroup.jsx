import dayjs from 'dayjs'
import TodoItem from './TodoItem'

const SECTIONS = [
  { key: 'today',    label: '오늘',     color: '#f59e0b' },
  { key: 'tomorrow', label: '내일',     color: '#3b82f6' },
  { key: 'week',     label: '이번 주',  color: '#8b5cf6' },
  { key: 'later',    label: '나중에',   color: '#10b981' },
  { key: 'none',     label: '날짜 없음',color: '#9ca3af' },
  { key: 'overdue',  label: '기한 지남', color: '#ef4444' },
]

function classify(todos) {
  const today    = dayjs().startOf('day')
  const tomorrow = today.add(1, 'day')
  const weekEnd  = today.add(7, 'day')
  const result   = { overdue: [], today: [], tomorrow: [], week: [], later: [], none: [] }

  todos.forEach(todo => {
    if (!todo.deadline) { result.none.push(todo); return }
    const d = dayjs(todo.deadline).startOf('day')
    if      (d.isBefore(today))   result.overdue.push(todo)
    else if (d.isSame(today))     result.today.push(todo)
    else if (d.isSame(tomorrow))  result.tomorrow.push(todo)
    else if (d.isBefore(weekEnd)) result.week.push(todo)
    else                          result.later.push(todo)
  })
  return result
}

export default function TodoDateGroup({ todos, loading, onEdit, onDelete, onToggle, onDetail }) {
  if (!todos.length) {
    return loading
      ? <div className="empty">로딩 중...</div>
      : <div className="empty">할일이 없습니다. 새 할일을 추가해보세요!</div>
  }
  const groups = classify(todos)

  return (
    <div className="date-groups">
      {SECTIONS.map(({ key, label, color }) => {
        const items = groups[key]
        if (!items.length) return null
        return (
          <div key={key} className="date-group">
            <div className="date-group-header">
              <span className="date-group-bar" style={{ background: color }} />
              <span className="date-group-label">{label}</span>
              <span className="date-group-count" style={{ background: color }}>{items.length}</span>
            </div>
            <div className="todo-list">
              {items.map(todo => (
                <TodoItem key={todo.id} todo={todo}
                  onEdit={onEdit} onDelete={onDelete}
                  onToggle={onToggle} onDetail={onDetail} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
