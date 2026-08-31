package com.example.todolist.dto.response;

import com.example.todolist.entity.Category;
import com.example.todolist.entity.Todo;

import java.time.LocalDateTime;

public record TodoResponse(
        Long id,
        String title,
        String content,
        LocalDateTime deadline,
        boolean completed,
        Category category,
        boolean deadlineImminent,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TodoResponse from(Todo todo) {
        boolean imminent = todo.getDeadline() != null
                && !todo.isCompleted()
                && todo.getDeadline().isAfter(LocalDateTime.now())
                && todo.getDeadline().isBefore(LocalDateTime.now().plusHours(24));

        return new TodoResponse(
                todo.getId(),
                todo.getTitle(),
                todo.getContent(),
                todo.getDeadline(),
                todo.isCompleted(),
                todo.getCategory(),
                imminent,
                todo.getCreatedAt(),
                todo.getUpdatedAt()
        );
    }
}
