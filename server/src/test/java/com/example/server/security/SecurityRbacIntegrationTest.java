package com.example.server.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "socket.tcp.port=0")
@AutoConfigureMockMvc
@DisplayName("Kiểm thử Tích hợp Phân quyền Bảo mật (RBAC & Security Filter Chain)")
class SecurityRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Chưa đăng nhập truy cập /api/auth/me bị chặn với mã 401")
    void testGetMeUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("Chưa đăng nhập truy cập /api/users bị chặn với mã 401")
    void testGetUsersUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @WithMockUser(username = "student_alice", roles = {"STUDENT"})
    @DisplayName("Thí sinh (ROLE_STUDENT) cố tình truy cập /api/users bị chặn với mã 403 Forbidden")
    void testGetUsersForbiddenForUserRole() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @WithMockUser(username = "teacher_super", roles = {"TEACHER"})
    @DisplayName("Giáo viên (ROLE_TEACHER) truy cập /api/users thành công 200 OK")
    void testGetUsersAllowedForAdminRole() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @WithMockUser(username = "student_alice", roles = {"STUDENT"})
    @DisplayName("Thí sinh (ROLE_STUDENT) cố tình gọi DELETE /api/questions/1 bị chặn với mã 403 Forbidden")
    void testDeleteQuestionForbiddenForUserRole() throws Exception {
        mockMvc.perform(delete("/api/questions/1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @WithMockUser(username = "student_alice", roles = {"STUDENT"})
    @DisplayName("Thí sinh (ROLE_STUDENT) cố tình gọi DELETE /api/rooms/1 bị chặn với mã 403 Forbidden")
    void testDeleteRoomForbiddenForUserRole() throws Exception {
        mockMvc.perform(delete("/api/rooms/1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @DisplayName("Chưa đăng nhập gọi /api/attempts/start bị chặn với mã 401")
    void testStartAttemptUnauthenticated() throws Exception {
        String requestJson = "{\"roomCode\":\"ROOM_01\",\"mode\":\"PRACTICE\"}";
        mockMvc.perform(post("/api/attempts/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }
}
