import { gatewayClient, GATEWAY_OPCODES } from './gatewayClient'
import type {
  RoomSummaryDto,
  RoomDetailResponse,
  CreateRoomRequest,
  UpdateRoomRequest,
} from '@/types'

export const roomService = {
  async getRooms(): Promise<RoomSummaryDto[]> {
    return gatewayClient.request<RoomSummaryDto[]>(GATEWAY_OPCODES.ROOM_LIST_REQ)
  },

  async getRoomById(id: number): Promise<RoomSummaryDto> {
    return gatewayClient.request<RoomSummaryDto>(GATEWAY_OPCODES.ROOM_LIST_REQ, { id })
  },

  async getRoomDetail(roomCode: string): Promise<RoomDetailResponse> {
    return gatewayClient.request<RoomDetailResponse>(GATEWAY_OPCODES.ROOM_LIST_REQ, { roomCode, detail: true })
  },

  async createRoom(payload: CreateRoomRequest): Promise<RoomSummaryDto> {
    return gatewayClient.request<RoomSummaryDto>(GATEWAY_OPCODES.ROOM_CREATE_REQ, payload)
  },

  async updateRoom(id: number, payload: UpdateRoomRequest): Promise<RoomSummaryDto> {
    return gatewayClient.request<RoomSummaryDto>(GATEWAY_OPCODES.ROOM_CREATE_REQ, { id, ...payload })
  },

  async deleteRoom(id: number): Promise<void> {
    await gatewayClient.request(GATEWAY_OPCODES.ROOM_CREATE_REQ, { id, action: 'delete' })
  },

  async joinRoom(roomCode: string): Promise<RoomSummaryDto> {
    return gatewayClient.request<RoomSummaryDto>(GATEWAY_OPCODES.ROOM_JOIN_REQ, { roomCode })
  },

  async leaveRoom(roomCode: string): Promise<void> {
    await gatewayClient.request(GATEWAY_OPCODES.ROOM_JOIN_REQ, { roomCode, action: 'leave' })
  },

  async startRoom(roomCode: string): Promise<void> {
    await gatewayClient.request(GATEWAY_OPCODES.EXAM_START_REQ, { roomCode })
  },

  async finishRoom(roomCode: string): Promise<Record<string, number>> {
    return gatewayClient.request<Record<string, number>>(GATEWAY_OPCODES.EXAM_SUBMIT_REQ, { roomCode })
  },
}
