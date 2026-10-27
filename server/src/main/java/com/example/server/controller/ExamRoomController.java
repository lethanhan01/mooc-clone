package com.example.server.controller;

import com.example.server.dto.common.ApiResponse;
import com.example.server.dto.room.CreateRoomRequest;
import com.example.server.dto.room.RoomDetailResponse;
import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.dto.room.UpdateRoomRequest;
import com.example.server.entity.ExamRoomEntity;
import com.example.server.service.RoomService;
import com.example.server.util.SpecificationBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;

/**
 * Controller quản lý Phòng thi trực tuyến kế thừa 5 API CRUD chuẩn từ BaseController
 * và bổ sung các nghiệp vụ thời gian thực: Tham gia, Rời phòng, Bắt đầu phòng thi.
 */
@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Exam Rooms", description = "Quản lý vòng đời phòng thi trắc nghiệm (Kế thừa BaseController)")
public class ExamRoomController extends BaseController<ExamRoomEntity, Long, CreateRoomRequest, UpdateRoomRequest, RoomSummaryDto, RoomService> {

    public ExamRoomController(RoomService service) {
        super(service);
    }

    @Override
    protected Specification<ExamRoomEntity> buildSpecification(HttpServletRequest request) {
        return SpecificationBuilder.fromRequest(
                request,
                Set.of("status", "visibility"),
                Set.of("name", "topic", "roomCode")
        );
    }

    @Override
    @Operation(summary = "Tạo phòng thi mới (Người tạo tự động làm chủ phòng)")
    public ResponseEntity<ApiResponse<RoomSummaryDto>> create(@Valid @RequestBody CreateRoomRequest request) {
        return super.create(request);
    }

    @Override
    @Operation(summary = "Cập nhật cấu hình phòng thi (Dành cho chủ phòng hoặc ADMIN)")
    public ResponseEntity<ApiResponse<RoomSummaryDto>> update(@PathVariable Long id, @Valid @RequestBody UpdateRoomRequest request) {
        return super.update(id, request);
    }

    @PostMapping("/{roomCode}/join")
    @Operation(summary = "Thí sinh tham gia phòng thi")
    public ResponseEntity<ApiResponse<RoomSummaryDto>> joinRoom(
            @PathVariable String roomCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "guest";
        RoomSummaryDto summary = service.joinRoom(roomCode, username, username);
        return ResponseEntity.ok(ApiResponse.success("Tham gia phòng thi thành công", summary));
    }

    @PostMapping("/{roomCode}/leave")
    @Operation(summary = "Thí sinh rời phòng thi")
    public ResponseEntity<ApiResponse<Void>> leaveRoom(
            @PathVariable String roomCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "guest";
        service.leaveRoom(roomCode, username);
        return ResponseEntity.ok(ApiResponse.success("Rời phòng thi thành công", null));
    }

    @PostMapping("/{roomCode}/start")
    @Operation(summary = "Khởi động phòng thi")
    public ResponseEntity<ApiResponse<Void>> startRoom(@PathVariable String roomCode) {
        service.startRoom(roomCode);
        return ResponseEntity.ok(ApiResponse.success("Phòng thi đã bắt đầu", null));
    }

    @GetMapping("/{roomCode}/detail")
    @Operation(summary = "Tra cứu chi tiết phòng thi theo mã phòng")
    public ResponseEntity<ApiResponse<RoomDetailResponse>> getRoomDetail(@PathVariable String roomCode) {
        RoomDetailResponse detail = service.getRoomDetail(roomCode);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Alias tra cứu chi tiết phòng thi theo mã phòng (Tương thích RESTful)")
    public ResponseEntity<ApiResponse<RoomDetailResponse>> getByCode(@PathVariable String code) {
        return getRoomDetail(code);
    }

    @PostMapping("/{roomCode}/finish")
    @Operation(summary = "Kết thúc phòng thi")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> finishRoom(@PathVariable String roomCode) {
        Map<String, Integer> results = service.finishRoom(roomCode);
        return ResponseEntity.ok(ApiResponse.success("Phòng thi đã kết thúc", results));
    }

    @Override
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Hủy phòng thi (Dành riêng cho TEACHER)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        return super.delete(id);
    }
}
