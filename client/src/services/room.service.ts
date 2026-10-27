import api from './api'
import type {
  ApiResponse,
  RoomSummaryDto,
  RoomDetailResponse,
  CreateRoomRequest,
  UpdateRoomRequest,
} from '@/types'

export const roomService = {
  async getRooms(): Promise<RoomSummaryDto[]> {
    const response = await api.get<ApiResponse<RoomSummaryDto[]>>('/rooms')
    return response.data.data
  },

  async getRoomById(id: number): Promise<RoomSummaryDto> {
    const response = await api.get<ApiResponse<RoomSummaryDto>>(`/rooms/${id}`)
    return response.data.data
  },

  async getRoomDetail(roomCode: string): Promise<RoomDetailResponse> {
    const response = await api.get<ApiResponse<RoomDetailResponse>>(`/rooms/${roomCode}/detail`)
    return response.data.data
  },

  async createRoom(payload: CreateRoomRequest): Promise<RoomSummaryDto> {
    const response = await api.post<ApiResponse<RoomSummaryDto>>('/rooms', payload)
    return response.data.data
  },

  async updateRoom(id: number, payload: UpdateRoomRequest): Promise<RoomSummaryDto> {
    const response = await api.put<ApiResponse<RoomSummaryDto>>(`/rooms/${id}`, payload)
    return response.data.data
  },

  async deleteRoom(id: number): Promise<void> {
    await api.delete(`/rooms/${id}`)
  },

  async joinRoom(roomCode: string): Promise<RoomSummaryDto> {
    const response = await api.post<ApiResponse<RoomSummaryDto>>(`/rooms/${roomCode}/join`)
    return response.data.data
  },

  async leaveRoom(roomCode: string): Promise<void> {
    await api.post(`/rooms/${roomCode}/leave`)
  },

  async startRoom(roomCode: string): Promise<void> {
    await api.post(`/rooms/${roomCode}/start`)
  },

  async finishRoom(roomCode: string): Promise<Record<string, number>> {
    const response = await api.post<ApiResponse<Record<string, number>>>(`/rooms/${roomCode}/finish`)
    return response.data.data
  },
}
