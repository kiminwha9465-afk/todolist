package com.example.todolist.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "아이디를 입력해주세요")
        @Size(min = 3, max = 20, message = "아이디는 3~20자이어야 합니다")
        String username,

        @NotBlank(message = "비밀번호를 입력해주세요")
        @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다")
        String password
) {}
