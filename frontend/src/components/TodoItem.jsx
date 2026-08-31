import dayjs from 'dayjs'

const CATEGORY_LABELS = { WORK: '업무', PERSONAL: '개인', STUDY: '학습', OTHER: '기타' }
const CATEGORY_COLORS = { WORK: '#3b82f6', PERSONAL: '#10b981', STUDY: '#f59e0b', OTHER: '#8b5cf6' }

export default function TodoItem({ todo, onEdit, onDelete, onToggle }) {
  const { id, title, content, deadline, completed, category, deadlineImminent } = todo

  return (
    <div className={`todo-item${completed ? ' completed' : ''}${deadlineImminent ? ' imminent' : ''}`}>
      <div className="todo-left">
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onToggle(id)}
          className="todo-check"
        />
        <div className="todo-body">
          <div className="todo-title-row">
            <span className="todo-title">{title}</span>
            {deadlineImminent && <span className="badge red">마감 임박</span>}
            {completed && <span className="badge green">완료</span>}
            {category && (
              <span className="badge" style={{ backgroundColor: CATEGORY_COLORS[category] }}>
                {CATEGORY_LABELS[category]}
              </span>
            )}
          </div>
          {content && <p className="todo-content">{content}</p>}
          {deadline && (
            <span className="todo-deadline">
              📅 {dayjs(deadline).format('YYYY.MM.DD HH:mm')}
            </span>
          )}
        </div>
      </div>
      <div className="todo-actions">
        <button className="btn sm secondary" onClick={() => onEdit(todo)}>수정</button>
        <button className="btn sm danger" onClick={() => onDelete(id)}>삭제</button>
      </div>
    </div>
  )
}
