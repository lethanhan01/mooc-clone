/**
 * attempt.ts - Kiểu dữ liệu Lượt thi và Chấm điểm trực tuyến đồng bộ với Server DTOs.
 */

export type AttemptMode = 'EXAM' | 'PRACTICE'
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED'

export interface StartAttemptRequest {
  roomCode?: string
  mode: AttemptMode
}

export interface SubmitAnswerRequest {
  questionId: number
  selectedOptionId?: number | null
}

export interface AttemptAnswerResponse {
  questionId: number
  position: number
  selectedOptionId?: number | null
  answeredAt?: string | null
}

export interface AttemptResultResponse {
  attemptId: number
  userId: number
  username: string
  displayName: string
  roomId?: number | null
  roomCode?: string | null
  mode: AttemptMode
  status: AttemptStatus
  totalQuestions: number
  answeredCount: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  score10: number
  correctPercent: number
  startedAt: string
  submittedAt?: string | null
  answers: AttemptAnswerResponse[]
}
