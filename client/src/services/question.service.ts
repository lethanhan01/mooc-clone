import { gatewayClient, GATEWAY_OPCODES } from './gatewayClient'
import type {
  QuestionResponse,
  CreateQuestionRequest,
} from '@/types'

export const questionService = {
  async getQuestions(): Promise<QuestionResponse[]> {
    return gatewayClient.request<QuestionResponse[]>(GATEWAY_OPCODES.ROOM_LIST_REQ, { type: 'questions' })
  },

  async getQuestionsByTopic(topic: string): Promise<QuestionResponse[]> {
    return gatewayClient.request<QuestionResponse[]>(GATEWAY_OPCODES.ROOM_LIST_REQ, { topic })
  },

  async getQuestionById(id: number): Promise<QuestionResponse> {
    return gatewayClient.request<QuestionResponse>(GATEWAY_OPCODES.ROOM_LIST_REQ, { questionId: id })
  },

  async createQuestion(payload: CreateQuestionRequest): Promise<QuestionResponse> {
    return gatewayClient.request<QuestionResponse>(GATEWAY_OPCODES.ROOM_CREATE_REQ, { question: payload })
  },

  async deleteQuestion(id: number): Promise<void> {
    await gatewayClient.request(GATEWAY_OPCODES.ROOM_CREATE_REQ, { questionId: id, action: 'delete' })
  },
}
