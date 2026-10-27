package com.example.server.config;

import com.example.server.entity.AuditLogEntity;
import com.example.server.entity.ExamRoomEntity;
import com.example.server.entity.QuestionEntity;
import com.example.server.entity.QuestionOptionEntity;
import com.example.server.entity.UserEntity;
import com.example.server.entity.enums.DifficultyLevel;
import com.example.server.entity.enums.QuestionStatus;
import com.example.server.entity.enums.QuestionType;
import com.example.server.entity.enums.RoomStatus;
import com.example.server.entity.enums.RoomVisibility;
import com.example.server.entity.enums.SystemRole;
import com.example.server.entity.enums.UserStatus;
import com.example.server.repository.AuditLogRepository;
import com.example.server.repository.ExamRoomRepository;
import com.example.server.repository.QuestionOptionRepository;
import com.example.server.repository.QuestionRepository;
import com.example.server.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DatabaseSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final ExamRoomRepository roomRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          QuestionRepository questionRepository,
                          QuestionOptionRepository optionRepository,
                          ExamRoomRepository roomRepository,
                          AuditLogRepository auditLogRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.roomRepository = roomRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info(">>> [DatabaseSeeder] Bắt đầu kiểm tra và đồng bộ Seed Data 3NF...");

        // 1. Đồng bộ tài khoản mẫu chuẩn
        String defaultPasswordHash = passwordEncoder.encode("password123");

        UserEntity admin = syncUser("admin", "admin@mooc.local", defaultPasswordHash, "Quản Trị Viên Hệ Thống", SystemRole.ADMIN);
        UserEntity teacher = syncUser("teacher_le", "teacher.le@mooc.local", defaultPasswordHash, "Thầy Lê Văn Hướng", SystemRole.USER);
        UserEntity alice = syncUser("student_alice", "alice@mooc.local", defaultPasswordHash, "Nguyễn Thị Alice", SystemRole.USER);
        syncUser("student_bob", "bob@mooc.local", defaultPasswordHash, "Trần Văn Bob", SystemRole.USER);

        // 2. Đồng bộ Ngân hàng câu hỏi nếu chưa có câu hỏi nào
        if (questionRepository.count() == 0) {
            log.info(">>> [DatabaseSeeder] Đang nạp 15 câu hỏi mẫu 3NF...");
            seedQuestions(teacher);
        }

        // 3. Đồng bộ Phòng thi mẫu nếu chưa có
        if (roomRepository.count() == 0) {
            log.info(">>> [DatabaseSeeder] Đang nạp 3 phòng thi mẫu...");
            seedRooms(teacher);
        }

        // 4. Ghi nhận log khởi tạo
        if (auditLogRepository.count() == 0) {
            AuditLogEntity audit = new AuditLogEntity();
            audit.setActor(admin);
            audit.setAction("SYSTEM_INIT");
            audit.setEntityType("SYSTEM");
            audit.setIpAddress("127.0.0.1");
            audit.setMetadata("{\"event\": \"DATABASE_SEEDED_3NF\", \"version\": \"2.0.0\"}");
            auditLogRepository.save(audit);
        }

        log.info(">>> [DatabaseSeeder] Hoàn tất đồng bộ dữ liệu mẫu thành công!");
    }

    private UserEntity syncUser(String username, String email, String passwordHash, String displayName, SystemRole role) {
        Optional<UserEntity> existingOpt = userRepository.findByUsername(username);
        UserEntity user;
        if (existingOpt.isPresent()) {
            user = existingOpt.get();
            user.setPasswordHash(passwordHash);
            user.setDisplayName(displayName);
            user.setEmail(email);
            user.setSystemRole(role);
            user.setStatus(UserStatus.ACTIVE);
        } else {
            user = new UserEntity(username, email, passwordHash, displayName, role);
            user.setStatus(UserStatus.ACTIVE);
        }
        return userRepository.save(user);
    }

    private void seedQuestions(UserEntity author) {
        String netTopic = "Lập trình Mạng (IT4062)";
        String dbTopic = "Hệ Quản trị Cơ sở Dữ liệu";
        String dsaTopic = "Cấu trúc Dữ liệu & Giải thuật";

        // Mạng máy tính
        createQuestion(netTopic, DifficultyLevel.EASY, "Mô hình tham chiếu OSI tiêu chuẩn bao gồm bao nhiêu tầng?", author,
                List.of("4 tầng", "5 tầng", "7 tầng", "8 tầng"), 2);
        createQuestion(netTopic, DifficultyLevel.EASY, "Giao thức nào thuộc tầng Giao vận cung cấp dịch vụ tin cậy và hướng kết nối?", author,
                List.of("TCP", "UDP", "IP", "ICMP"), 0);
        createQuestion(netTopic, DifficultyLevel.MEDIUM, "Trong Java NIO, thành phần nào cho phép một luồng giám sát nhiều kênh bất đồng bộ?", author,
                List.of("Selector", "ServerSocket", "DatagramPacket", "ByteArrayInputStream"), 0);
        createQuestion(netTopic, DifficultyLevel.MEDIUM, "Mã trạng thái phản hồi HTTP 404 mang ý nghĩa gì?", author,
                List.of("Bad Request", "Unauthorized", "Forbidden", "Not Found"), 3);
        createQuestion(netTopic, DifficultyLevel.HARD, "Hiện tượng TCP SYN Flood là hình thức tấn công khai thác cơ chế nào?", author,
                List.of("Làm tràn half-open connection backlog queue", "Giả mạo ARP cache", "Tràn bộ đệm heap", "Cạn dải DHCP"), 0);

        // Cơ sở dữ liệu
        createQuestion(dbTopic, DifficultyLevel.EASY, "Mệnh đề nào trong SQL SELECT được dùng để lọc bản ghi thỏa mãn điều kiện?", author,
                List.of("WHERE", "ORDER BY", "GROUP BY", "LIMIT"), 0);
        createQuestion(dbTopic, DifficultyLevel.EASY, "Đặc tính nào trong ACID đảm bảo giao tác thực thi trọn vẹn hoặc bị hoàn nguyên toàn bộ?", author,
                List.of("Atomicity", "Consistency", "Isolation", "Durability"), 0);
        createQuestion(dbTopic, DifficultyLevel.MEDIUM, "Kiểu chỉ mục (Index) mặc định và thông dụng nhất trong PostgreSQL là gì?", author,
                List.of("B-Tree", "Hash Index", "GIN", "BRIN"), 0);
        createQuestion(dbTopic, DifficultyLevel.MEDIUM, "Dạng chuẩn 3NF (Third Normal Form) yêu cầu điều kiện nào sau đây?", author,
                List.of("Đạt 2NF và không có phụ thuộc bắc cầu", "Mỗi thuộc tính là nguyên tố", "Phụ thuộc hàm toàn phần", "Không có duplicate index"), 0);
        createQuestion(dbTopic, DifficultyLevel.HARD, "Hiện tượng Phantom Read có thể xuất hiện ở mức cô lập giao tác nào trong chuẩn ANSI SQL?", author,
                List.of("Repeatable Read", "Serializable", "Snapshot Isolation", "Không bao giờ"), 0);

        // Cấu trúc dữ liệu
        createQuestion(dsaTopic, DifficultyLevel.EASY, "Cấu trúc dữ liệu nào hoạt động theo nguyên lý LIFO (Vào sau - Ra trước)?", author,
                List.of("Stack (Ngăn xếp)", "Queue (Hàng đợi)", "Array (Mảng)", "Linked List"), 0);
        createQuestion(dsaTopic, DifficultyLevel.EASY, "Độ phức tạp thời gian trung bình của tìm kiếm nhị phân trên mảng đã sắp xếp là?", author,
                List.of("O(log n)", "O(n)", "O(n log n)", "O(1)"), 0);
        createQuestion(dsaTopic, DifficultyLevel.MEDIUM, "Thuật toán sắp xếp nào sau đây áp dụng tư tưởng Chia để trị (Divide and Conquer)?", author,
                List.of("Merge Sort", "Bubble Sort", "Insertion Sort", "Selection Sort"), 0);
        createQuestion(dsaTopic, DifficultyLevel.MEDIUM, "Cấu trúc dữ liệu nào cho phép tìm kiếm, chèn và xóa trung bình O(1)?", author,
                List.of("Bảng băm (Hash Table)", "Cây nhị phân (BST)", "Binary Heap", "Danh sách liên kết"), 0);
        createQuestion(dsaTopic, DifficultyLevel.HARD, "Thuật toán Dijkstra được sử dụng để giải quyết bài toán nào trên đồ thị?", author,
                List.of("Đường đi ngắn nhất từ một nguồn", "Cây khung nhỏ nhất (MST)", "Luồng cực đại", "Chu trình Euler"), 0);
    }

    private void createQuestion(String topic, DifficultyLevel diff, String content, UserEntity author, List<String> optionTexts, int correctIndex) {
        QuestionEntity question = new QuestionEntity(topic, diff, content, author);
        question.setQuestionType(QuestionType.SINGLE_CHOICE);
        question.setStatus(QuestionStatus.ACTIVE);
        QuestionEntity savedQ = questionRepository.save(question);

        List<QuestionOptionEntity> options = new ArrayList<>();
        for (int i = 0; i < optionTexts.size(); i++) {
            options.add(new QuestionOptionEntity(savedQ, optionTexts.get(i), (short) (i + 1), i == correctIndex));
        }
        optionRepository.saveAll(options);
    }

    private void seedRooms(UserEntity teacher) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // Room 1: WAITING
        ExamRoomEntity room1 = new ExamRoomEntity();
        room1.setRoomCode("NET-WAIT01");
        room1.setOwner(teacher);
        room1.setName("Phòng Thi Thử Mạng Máy Tính - Ca 1");
        room1.setDescription("Phòng luyện thi thử nghiệm các câu hỏi chuyên sâu môn Lập trình Mạng");
        room1.setTopic("Lập trình Mạng (IT4062)");
        room1.setEasyCount(2);
        room1.setMediumCount(2);
        room1.setHardCount(1);
        room1.setVisibility(RoomVisibility.PUBLIC);
        room1.setStatus(RoomStatus.WAITING);
        room1.setDurationSeconds(900);
        room1.setMaxParticipants(30);
        roomRepository.save(room1);

        // Room 2: RUNNING
        ExamRoomEntity room2 = new ExamRoomEntity();
        room2.setRoomCode("DB-RUN001");
        room2.setOwner(teacher);
        room2.setName("Kiểm Tra Giữa Kỳ CSDL - Đang Diễn Ra");
        room2.setDescription("Phòng thi trực tuyến thời gian thực môn Cơ sở Dữ liệu");
        room2.setTopic("Hệ Quản trị Cơ sở Dữ liệu");
        room2.setEasyCount(2);
        room2.setMediumCount(1);
        room2.setHardCount(0);
        room2.setVisibility(RoomVisibility.PUBLIC);
        room2.setStatus(RoomStatus.RUNNING);
        room2.setDurationSeconds(1200);
        room2.setMaxParticipants(40);
        room2.setStartedAt(now.minusMinutes(5));
        room2.setEndsAt(now.plusMinutes(15));
        roomRepository.save(room2);

        // Room 3: ENDED
        ExamRoomEntity room3 = new ExamRoomEntity();
        room3.setRoomCode("FINAL-2026");
        room3.setOwner(teacher);
        room3.setName("Thi Kết Thúc Học Phần Mạng & CSDL");
        room3.setDescription("Phòng thi chính thức tổng hợp kiến thức cuối kỳ");
        room3.setTopic(null);
        room3.setEasyCount(2);
        room3.setMediumCount(1);
        room3.setHardCount(0);
        room3.setVisibility(RoomVisibility.PUBLIC);
        room3.setStatus(RoomStatus.ENDED);
        room3.setDurationSeconds(600);
        room3.setMaxParticipants(50);
        room3.setStartedAt(now.minusMinutes(30));
        room3.setEndsAt(now.minusMinutes(20));
        room3.setEndedAt(now.minusMinutes(20));
        roomRepository.save(room3);
    }
}
