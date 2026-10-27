import api from './api'
import type {
  ApiResponse,
  AttemptResultResponse,
  StartAttemptRequest,
  SubmitAnswerRequest,
} from '@/types'

export const attemptService = {
  async startAttempt(payload: StartAttemptRequest): Promise<AttemptResultResponse> {
    const response = await api.post<ApiResponse<AttemptResultResponse>>('/attempts/start', payload)
    return response.data.data
  },

  async submitAnswer(attemptId: number, payload: SubmitAnswerRequest): Promise<void> {
    await api.post(`/attempts/${attemptId}/answers`, payload)
  },

  async submitExam(attemptId: number): Promise<AttemptResultResponse> {
    const response = await api.post<ApiResponse<AttemptResultResponse>>(`/attempts/${attemptId}/submit`)
    return response.data.data
  },

  async getResult(attemptId: number): Promise<AttemptResultResponse> {
    const response = await api.get<ApiResponse<AttemptResultResponse>>(`/attempts/${attemptId}/result`)
    return response.data.data
  },
}
