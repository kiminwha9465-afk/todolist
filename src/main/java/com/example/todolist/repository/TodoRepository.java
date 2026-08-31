package com.example.todolist.repository;

import com.example.todolist.entity.Category;
import com.example.todolist.entity.Todo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    Page<Todo> findByCategory(Category category, Pageable pageable);

    Page<Todo> findByCompleted(boolean completed, Pageable pageable);

    Page<Todo> findByCategoryAndCompleted(Category category, boolean completed, Pageable pageable);
}
