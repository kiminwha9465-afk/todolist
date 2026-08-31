package com.example.todolist.repository;

import com.example.todolist.entity.Category;
import com.example.todolist.entity.Todo;
import com.example.todolist.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query("SELECT t FROM Todo t WHERE t.user = :user " +
           "AND (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR (t.content IS NOT NULL AND LOWER(t.content) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:completed IS NULL OR t.completed = :completed)")
    Page<Todo> search(
            @Param("user") User user,
            @Param("keyword") String keyword,
            @Param("category") Category category,
            @Param("completed") Boolean completed,
            Pageable pageable
    );

    Optional<Todo> findByIdAndUser(Long id, User user);
}
