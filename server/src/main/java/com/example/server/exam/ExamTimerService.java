package com.example.server.exam;

import com.example.server.socket.RoomEventBus;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Dịch vụ đếm lùi thời gian phòng thi thời gian thực (Exam Timer Service).
 * Phát nhịp 1 giây/lần cho các phòng đang trong trạng thái IN_PROGRESS.
 */
@Service
public class ExamTimerService {

    private static final Logger log = LoggerFactory.getLogger(ExamTimerService.class);

    private final ExamRoomService examRoomService;
    private final RoomEventBus roomEventBus;
    private final ScheduledExecutorService scheduler;

    public ExamTimerService(ExamRoomService examRoomService, RoomEventBus roomEventBus) {
        this.examRoomService = examRoomService;
        this.roomEventBus = roomEventBus;
        this.scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "exam-timer-thread");
            t.setDaemon(true);
            return t;
        });
    }

    @PostConstruct
    public void startTimer() {
        log.info("[Exam Timer] Starting 1-second pulse timer scheduler...");
        scheduler.scheduleAtFixedRate(this::tickAllActiveRooms, 1, 1, TimeUnit.SECONDS);
    }

    private void tickAllActiveRooms() {
        try {
            for (ExamRoomState room : examRoomService.getAllRooms()) {
                if ("IN_PROGRESS".equals(room.getStatus())) {
                    int remaining = room.decrementTime();
                    // Phát sóng time_tick cho toàn bộ thí sinh trong phòng (cả TCP và WebSocket)
                    roomEventBus.broadcastTimeTick(room.getRoomId(), remaining);

                    if (remaining <= 0) {
                        log.info("[Exam Timer] Room {} has finished. Calculating scores...", room.getRoomId());
                        Map<String, Integer> scores = examRoomService.finishExam(room.getRoomId());
                        roomEventBus.broadcastExamFinished(room.getRoomId(), scores);
                        roomEventBus.broadcastRoomUpdated(room.getRoomId());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error during timer tick", e);
        }
    }

    @PreDestroy
    public void stopTimer() {
        scheduler.shutdown();
    }
}
