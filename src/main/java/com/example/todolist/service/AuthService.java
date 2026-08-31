package com.example.todolist.service;

import com.example.todolist.dto.request.LoginRequest;
import com.example.todolist.dto.request.SignupRequest;
import com.example.todolist.dto.response.TokenResponse;
import com.example.todolist.entity.User;
import com.example.todolist.repository.UserRepository;
import com.example.todolist.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public TokenResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .build();
        userRepository.save(user);
        return new TokenResponse(jwtTokenProvider.generateToken(user.getUsername()), user.getUsername());
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        return new TokenResponse(jwtTokenProvider.generateToken(user.getUsername()), user.getUsername());
    }
}
