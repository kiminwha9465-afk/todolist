package com.example.todolist.service;

import com.example.todolist.dto.request.TodoRequest;
import com.example.todolist.dto.response.TodoResponse;
import com.example.todolist.entity.Category;
import com.example.todolist.entity.Todo;
import com.example.todolist.exception.TodoNotFoundException;
import com.example.todolist.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {

    private final TodoRepository todoRepository;

    public Page<TodoResponse> getTodos(Category category, Boolean completed, Pageable pageable) {
        Page<Todo> todos;
        if (category != null && completed != null) {
            todos = todoRepository.findByCategoryAndCompleted(category, completed, pageable);
        } else if (category != null) {
            todos = todoRepository.findByCategory(category, pageable);
        } else if (completed != null) {
            todos = todoRepository.findByCompleted(completed, pageable);
        } else {
            todos = todoRepository.findAll(pageable);
        }
        return todos.map(TodoResponse::from);
    }

    public TodoResponse getTodo(Long id) {
        return TodoResponse.from(findById(id));
    }

    @Transactional
    public TodoResponse createTodo(TodoRequest request) {
        Todo todo = Todo.builder()
                .title(request.title())
                .content(request.content())
                .deadline(request.deadline())
                .category(request.category())
                .build();
        return TodoResponse.from(todoRepository.save(todo));
    }

    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo todo = findById(id);
        todo.setTitle(request.title());
        todo.setContent(request.content());
        todo.setDeadline(request.deadline());
        todo.setCategory(request.category());
        return TodoResponse.from(todo);
    }

    @Transactional
    public void deleteTodo(Long id) {
        todoRepository.delete(findById(id));
    }

    @Transactional
    public TodoResponse toggleComplete(Long id) {
        Todo todo = findById(id);
        todo.setCompleted(!todo.isCompleted());
        return TodoResponse.from(todo);
    }

    private Todo findById(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new TodoNotFoundException(id));
    }
}
