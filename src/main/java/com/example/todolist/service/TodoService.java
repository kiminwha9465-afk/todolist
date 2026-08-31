package com.example.todolist.service;

import com.example.todolist.dto.request.TodoRequest;
import com.example.todolist.dto.response.TodoResponse;
import com.example.todolist.entity.Category;
import com.example.todolist.entity.Todo;
import com.example.todolist.entity.User;
import com.example.todolist.exception.TodoNotFoundException;
import com.example.todolist.repository.TodoRepository;
import com.example.todolist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public Page<TodoResponse> getTodos(Category category, Boolean completed, Pageable pageable) {
        User user = currentUser();
        Page<Todo> todos;
        if (category != null && completed != null) {
            todos = todoRepository.findByUserAndCategoryAndCompleted(user, category, completed, pageable);
        } else if (category != null) {
            todos = todoRepository.findByUserAndCategory(user, category, pageable);
        } else if (completed != null) {
            todos = todoRepository.findByUserAndCompleted(user, completed, pageable);
        } else {
            todos = todoRepository.findByUser(user, pageable);
        }
        return todos.map(TodoResponse::from);
    }

    public TodoResponse getTodo(Long id) {
        return TodoResponse.from(findOwned(id));
    }

    @Transactional
    public TodoResponse createTodo(TodoRequest request) {
        Todo todo = Todo.builder()
                .title(request.title())
                .content(request.content())
                .deadline(request.deadline())
                .category(request.category())
                .user(currentUser())
                .build();
        return TodoResponse.from(todoRepository.save(todo));
    }

    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo todo = findOwned(id);
        todo.setTitle(request.title());
        todo.setContent(request.content());
        todo.setDeadline(request.deadline());
        todo.setCategory(request.category());
        return TodoResponse.from(todo);
    }

    @Transactional
    public void deleteTodo(Long id) {
        todoRepository.delete(findOwned(id));
    }

    @Transactional
    public TodoResponse toggleComplete(Long id) {
        Todo todo = findOwned(id);
        todo.setCompleted(!todo.isCompleted());
        return TodoResponse.from(todo);
    }

    private Todo findOwned(Long id) {
        return todoRepository.findByIdAndUser(id, currentUser())
                .orElseThrow(() -> new TodoNotFoundException(id));
    }

    private User currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}
