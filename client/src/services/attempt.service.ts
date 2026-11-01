import { gatewayClient, GATEWAY_OPCODES } from './gatewayClient'
import type {
  AttemptResultResponse,
  StartAttemptRequest,
  SubmitAnswerRequest,
} from '@/types'

export const attemptService = {
  async startAttempt(payload: StartAttemptRequest): Promise<AttemptResultResponse> {
    return gatewayClient.request<AttemptResultResponse>(GATEWAY_OPCODES.EXAM_START_REQ, payload)
  },

  async submitAnswer(attemptId: number, payload: SubmitAnswerRequest): Promise<void> {
    await gatewayClient.request(GATEWAY_OPCODES.EXAM_SUBMIT_REQ, { attemptId, ...payload })
  },

  async submitExam(attemptId: number): Promise<AttemptResultResponse> {
    return gatewayClient.request<AttemptResultResponse>(GATEWAY_OPCODES.EXAM_SUBMIT_REQ, { attemptId })
  },

  async getResult(attemptId: number): Promise<AttemptResultResponse> {
    return gatewayClient.request<AttemptResultResponse>(GATEWAY_OPCODES.EXAM_SUBMIT_REQ, { attemptId, action: 'result' })
  },
}
