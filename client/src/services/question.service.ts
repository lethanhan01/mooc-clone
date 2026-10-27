import api from './api'
import type {
  ApiResponse,
  QuestionResponse,
  CreateQuestionRequest,
} from '@/types'

export const questionService = {
  async getQuestions(): Promise<QuestionResponse[]> {
    const response = await api.get<ApiResponse<QuestionResponse[]>>('/questions')
    return response.data.data
  },

  async getQuestionsByTopic(topic: string): Promise<QuestionResponse[]> {
    const response = await api.get<ApiResponse<QuestionResponse[]>>(`/questions/topic/${encodeURIComponent(topic)}`)
    return response.data.data
  },

  async getQuestionById(id: number): Promise<QuestionResponse> {
    const response = await api.get<ApiResponse<QuestionResponse>>(`/questions/${id}`)
    return response.data.data
  },

  async createQuestion(payload: CreateQuestionRequest): Promise<QuestionResponse> {
    const response = await api.post<ApiResponse<QuestionResponse>>('/questions', payload)
    return response.data.data
  },

  async deleteQuestion(id: number): Promise<void> {
    await api.delete(`/questions/${id}`)
  },
}
