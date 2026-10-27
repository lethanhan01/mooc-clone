/**
 * question.ts - Kiểu dữ liệu Ngân hàng câu hỏi đồng bộ với Server DTOs.
 */

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'easy' | 'medium' | 'hard'
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
export type QuestionStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED'

export interface QuestionOptionResponse {
  id: number
  content: string
  position: number
  isCorrect?: boolean | null
}

export interface QuestionResponse {
  id: number
  topic: string
  difficulty: DifficultyLevel
  questionType: QuestionType
  content: string
  status: QuestionStatus
  options: QuestionOptionResponse[]
  createdAt?: string
}

export interface CreateQuestionOptionRequest {
  content: string
  position: number
  isCorrect: boolean
}

export interface CreateQuestionRequest {
  topic: string
  difficulty: DifficultyLevel
  questionType: QuestionType
  content: string
  options: CreateQuestionOptionRequest[]
}
