package com.example.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.security.test.context.support.WithMockUser;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "socket.tcp.port=0")
@AutoConfigureMockMvc
@DisplayName("Kiểm thử Tích hợp AuthController (Đăng ký, Đăng nhập, Đăng xuất)")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Đăng ký tài khoản mới thành công 201 Created")
    void testRegisterSuccess() throws Exception {
        String uniqueSuffix = String.valueOf(System.currentTimeMillis() % 1000000);
        Map<String, String> body = Map.of(
                "username", "user_" + uniqueSuffix,
                "email", "user_" + uniqueSuffix + "@mooc.local",
                "password", "secret123",
                "displayName", "Thí sinh " + uniqueSuffix
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("user_" + uniqueSuffix));
    }

    @Test
    @DisplayName("Đăng ký tài khoản với tên đăng nhập bị trùng trả về mã 400")
    void testRegisterDuplicateUsername() throws Exception {
        String uniqueSuffix = "dup_" + (System.currentTimeMillis() % 100000);
        Map<String, String> body = Map.of(
                "username", uniqueSuffix,
                "email", uniqueSuffix + "@mooc.local",
                "password", "secret123",
                "displayName", "Dup User"
        );

        // Tạo lần 1
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated());

        // Tạo lần 2 trùng username
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @DisplayName("Đăng nhập với mật khẩu sai trả về mã 401 Unauthorized")
    void testLoginInvalidCredentials() throws Exception {
        Map<String, String> body = Map.of(
                "usernameOrEmail", "non_existent_or_wrong",
                "password", "wrong_password_123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @WithMockUser(username = "test_user")
    @DisplayName("Đăng xuất thành công trả về 200 OK")
    void testLogoutSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
