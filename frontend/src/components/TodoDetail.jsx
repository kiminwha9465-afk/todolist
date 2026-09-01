import dayjs from 'dayjs'

const CATEGORY_LABELS = { WORK: '업무', PERSONAL: '개인', STUDY: '학습', OTHER: '기타' }
const CATEGORY_COLORS = { WORK: '#3b82f6', PERSONAL: '#06b6d4', STUDY: '#f59e0b', OTHER: '#8b5cf6' }

export default function TodoDetail({ todo, onClose, onEdit, onDelete, onToggle }) {
  const { id, title, content, deadline, completed, category, deadlineImminent, createdAt, updatedAt } = todo

  const handleDelete = () => {
    onClose()
    onDelete(id)
  }

  const handleEdit = () => {
    onClose()
    onEdit(todo)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div className="detail-badges">
            {deadlineImminent && <span className="badge red">마감 임박</span>}
            {completed && <span className="badge green">완료</span>}
            {category && (
              <span className="badge" style={{ backgroundColor: CATEGORY_COLORS[category] }}>
                {CATEGORY_LABELS[category]}
              </span>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <h2 className={`detail-title${completed ? ' completed' : ''}`}>{title}</h2>

        {content && (
          <div className="detail-section">
            <span className="detail-label">내용</span>
            <p className="detail-content">{content}</p>
          </div>
        )}

        <div className="detail-section">
          <span className="detail-label">마감일</span>
          <p className="detail-value">
            {deadline ? dayjs(deadline).format('YYYY년 MM월 DD일 HH:mm') : '없음'}
          </p>
        </div>


        <div className="detail-actions">
          <button className="btn secondary" onClick={() => onToggle(id)}>
            {completed ? '✓ 완료 취소' : '✓ 완료 처리'}
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn secondary" onClick={handleEdit}>수정</button>
            <button className="btn danger" onClick={handleDelete}>삭제</button>
          </div>
        </div>
      </div>
    </div>
  )
}
