import { useEffect, useState } from 'react'

const CATEGORIES = ['WORK', 'PERSONAL', 'STUDY', 'OTHER']
const CATEGORY_LABELS = { WORK: '업무', PERSONAL: '개인', STUDY: '학습', OTHER: '기타' }

export default function TodoForm({ initial, onSubmit, onCancel, defaultDeadline }) {
  const [form, setForm] = useState({ title: '', content: '', deadline: defaultDeadline || '', category: '' })

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        content: initial.content || '',
        deadline: initial.deadline ? initial.deadline.slice(0, 16) : '',
        category: initial.category || ''
      })
    } else {
      setForm({ title: '', content: '', deadline: defaultDeadline || '', category: '' })
    }
  }, [initial, defaultDeadline])

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title: form.title,
      content: form.content || null,
      deadline: form.deadline ? form.deadline + ':00' : null,
      category: form.category || null
    })
  }

  return (
    <div className="overlay">
      <form className="todo-form" onSubmit={handleSubmit}>
        <h2>{initial ? '할일 수정' : '새 할일'}</h2>

        <div className="form-group">
          <label>제목 *</label>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder="제목을 입력하세요"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>내용</label>
          <textarea
            value={form.content}
            onChange={set('content')}
            placeholder="내용을 입력하세요"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>마감일</label>
            <input type="datetime-local" value={form.deadline} onChange={set('deadline')} />
          </div>
          <div className="form-group">
            <label>카테고리</label>
            <select value={form.category} onChange={set('category')}>
              <option value="">없음</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onCancel}>취소</button>
          <button type="submit" className="btn primary">{initial ? '수정' : '등록'}</button>
        </div>
      </form>
    </div>
  )
}
