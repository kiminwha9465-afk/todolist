import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import TodoItem from './TodoItem'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function TodoCalendar({ todos, onEdit, onDelete, onToggle, onDetail }) {
  const [month, setMonth] = useState(dayjs().startOf('month'))
  const [selected, setSelected] = useState(dayjs().format('YYYY-MM-DD'))

  const byDate = useMemo(() => {
    const map = {}
    todos.forEach(t => {
      if (!t.deadline) return
      const k = dayjs(t.deadline).format('YYYY-MM-DD')
      if (!map[k]) map[k] = []
      map[k].push(t)
    })
    return map
  }, [todos])

  const noDeadline = useMemo(() => todos.filter(t => !t.deadline), [todos])

  const firstWeekday = month.day()
  const daysInMonth  = month.daysInMonth()
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7) cells.push(null)

  const today        = dayjs().format('YYYY-MM-DD')
  const selectedTodos = byDate[selected] || []

  return (
    <div className="cal-wrapper">
      {/* Month navigation */}
      <div className="cal-nav">
        <button className="btn secondary" onClick={() => setMonth(m => m.subtract(1, 'month'))}>‹</button>
        <span className="cal-title">{month.format('YYYY년 MM월')}</span>
        <button className="btn secondary" onClick={() => setMonth(m => m.add(1, 'month'))}>›</button>
      </div>

      {/* Calendar grid */}
      <div className="cal-grid">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`cal-weekday${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}`}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="cal-cell empty" />
          const dateKey = month.date(day).format('YYYY-MM-DD')
          const count   = (byDate[dateKey] || []).length
          const isToday    = dateKey === today
          const isSelected = dateKey === selected
          const col = i % 7
          return (
            <div
              key={dateKey}
              className={[
                'cal-cell',
                isToday    ? 'today'    : '',
                isSelected ? 'selected' : '',
                count      ? 'has-todo' : '',
                col === 0  ? 'sun'      : col === 6 ? 'sat' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setSelected(dateKey)}
            >
              <span className="cal-day">{day}</span>
              {count > 0 && <span className="cal-dot-row">
                {Array.from({ length: Math.min(count, 3) }).map((_, idx) => (
                  <span key={idx} className="cal-dot" />
                ))}
                {count > 3 && <span className="cal-dot-more">+{count - 3}</span>}
              </span>}
            </div>
          )
        })}
      </div>

      {/* Selected date todos */}
      <div className="cal-panel">
        <div className="date-group-header">
          <span className="date-group-bar" style={{ background: '#3b82f6' }} />
          <span className="date-group-label">
            {dayjs(selected).format('M월 D일')}
          </span>
          <span className="date-group-count" style={{ background: '#3b82f6' }}>
            {selectedTodos.length}개
          </span>
        </div>
        {selectedTodos.length === 0
          ? <p className="empty" style={{ padding: '16px 0' }}>이 날짜에 할일이 없습니다.</p>
          : (
            <div className="todo-list">
              {selectedTodos.map(todo => (
                <TodoItem key={todo.id} todo={todo}
                  onEdit={onEdit} onDelete={onDelete}
                  onToggle={onToggle} onDetail={onDetail} />
              ))}
            </div>
          )
        }

        {noDeadline.length > 0 && (
          <div className="date-group" style={{ marginTop: '24px' }}>
            <div className="date-group-header">
              <span className="date-group-bar" style={{ background: '#9ca3af' }} />
              <span className="date-group-label">날짜 없음</span>
              <span className="date-group-count" style={{ background: '#9ca3af' }}>{noDeadline.length}</span>
            </div>
            <div className="todo-list">
              {noDeadline.map(todo => (
                <TodoItem key={todo.id} todo={todo}
                  onEdit={onEdit} onDelete={onDelete}
                  onToggle={onToggle} onDetail={onDetail} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
