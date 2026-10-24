package com.example.server.exam;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Trạng thái phòng thi trực tuyến trong bộ nhớ (In-Memory Room State).
 */
public class ExamRoomState {
    private final String roomId;
    private final String roomName;
    private volatile String status; // "WAITING", "IN_PROGRESS", "FINISHED"
    private volatile int timeRemainingSeconds;
    private final int totalQuestions;

    // userId -> userName
    private final Map<String, String> participants = new ConcurrentHashMap<>();

    // userId -> (questionId -> selectedOption)
    private final Map<String, Map<String, String>> answers = new ConcurrentHashMap<>();

    // userId -> score
    private final Map<String, Integer> scores = new ConcurrentHashMap<>();

    public ExamRoomState(String roomId, String roomName, int durationSeconds, int totalQuestions) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.status = "WAITING";
        this.timeRemainingSeconds = durationSeconds;
        this.totalQuestions = totalQuestions;
    }

    public String getRoomId() {
        return roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getTimeRemainingSeconds() {
        return timeRemainingSeconds;
    }

    public void setTimeRemainingSeconds(int timeRemainingSeconds) {
        this.timeRemainingSeconds = timeRemainingSeconds;
    }

    public int decrementTime() {
        if (this.timeRemainingSeconds > 0) {
            this.timeRemainingSeconds--;
        }
        return this.timeRemainingSeconds;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public Map<String, String> getParticipants() {
        return Collections.unmodifiableMap(participants);
    }

    public void addParticipant(String userId, String userName) {
        participants.put(userId, userName);
    }

    public void removeParticipant(String userId) {
        participants.remove(userId);
    }

    public int getParticipantsCount() {
        return participants.size();
    }

    public void recordAnswer(String userId, String questionId, String selectedOption) {
        answers.computeIfAbsent(userId, k -> new ConcurrentHashMap<>()).put(questionId, selectedOption);
    }

    public Map<String, String> getUserAnswers(String userId) {
        return answers.getOrDefault(userId, Collections.emptyMap());
    }

    public Map<String, Integer> getScores() {
        return Collections.unmodifiableMap(scores);
    }

    public void recordScore(String userId, int score) {
        scores.put(userId, score);
    }
}
