/**
 * room.ts - Kiểu dữ liệu Phòng thi trắc nghiệm trực tuyến đồng bộ với Server DTOs.
 */

export type RoomStatus =
  | 'WAITING'
  | 'RUNNING'
  | 'ENDED'
  | 'CANCELLED'
  | 'waiting'
  | 'in_progress'
  | 'finished'
  | 'cancelled'

export type RoomVisibility = 'PUBLIC' | 'PRIVATE' | 'public' | 'private'

export interface RoomSummaryDto {
  id: number
  roomCode: string
  roomName: string
  status: RoomStatus
  durationSeconds: number
  totalQuestions: number
  participantsCount: number
  ownerId?: number
  ownerDisplayName?: string
}

export interface RoomDetailResponse {
  id: number
  roomCode: string
  name: string
  description?: string
  topic?: string
  easyCount: number
  mediumCount: number
  hardCount: number
  visibility: RoomVisibility
  status: RoomStatus
  durationSeconds: number
  maxParticipants?: number | null
  startedAt?: string | null
  endsAt?: string | null
  ownerId?: number
  ownerDisplayName?: string
  participantUsernames?: string[]
}

export interface CreateRoomRequest {
  roomCode: string
  name: string
  description?: string
  topic?: string
  easyCount: number
  mediumCount: number
  hardCount: number
  visibility: RoomVisibility
  durationSeconds: number
  maxParticipants?: number | null
}

export interface UpdateRoomRequest {
  name?: string
  description?: string
  visibility?: RoomVisibility
  durationSeconds?: number
  maxParticipants?: number | null
}
