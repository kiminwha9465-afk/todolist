import TodoItem from './TodoItem'

export default function TodoList({ todos, loading, page, currentPage, onPageChange, onEdit, onDelete, onToggle, onDetail }) {
  if (loading) return <div className="empty">로딩 중...</div>

  if (todos.length === 0) return (
    <div className="empty">할일이 없습니다. 새 할일을 추가해보세요!</div>
  )

  return (
    <div>
      <div className="todo-count">총 {page.totalElements}개</div>

      <div className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onDetail={onDetail}
          />
        ))}
      </div>

      {page.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn secondary"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
          >
            이전
          </button>
          <span className="page-info">{currentPage + 1} / {page.totalPages}</span>
          <button
            className="btn secondary"
            disabled={currentPage >= page.totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
