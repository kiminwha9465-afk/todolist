package com.example.todolist.repository;

import com.example.todolist.entity.Category;
import com.example.todolist.entity.Todo;
import com.example.todolist.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    Page<Todo> findByUser(User user, Pageable pageable);
    Page<Todo> findByUserAndCategory(User user, Category category, Pageable pageable);
    Page<Todo> findByUserAndCompleted(User user, boolean completed, Pageable pageable);
    Page<Todo> findByUserAndCategoryAndCompleted(User user, Category category, boolean completed, Pageable pageable);

    Optional<Todo> findByIdAndUser(Long id, User user);
}
