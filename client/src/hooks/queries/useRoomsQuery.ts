import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { roomService } from '@/services/room.service'
import type { CreateRoomRequest, RoomStatus, UpdateRoomRequest } from '@/types'

/**
 * Tính chu kỳ Adaptive Short Polling theo trạng thái phòng thi:
 * - WAITING: 2000ms (2 giây) để bắt lệnh Bắt đầu phòng thi nhanh.
 * - RUNNING: 3000ms (3 giây) kết hợp đồng hồ nội suy Clock-Offset 1 giây ở Client.
 * - ENDED / CANCELLED: false (tự động ngắt Polling để giải phóng tài nguyên).
 */
export function computeAdaptiveRoomPollingInterval(status?: RoomStatus | string | null): number | false {
  if (!status) return false
  const normalized = status.toUpperCase()
  if (normalized === 'WAITING') return 2000
  if (normalized === 'RUNNING' || status === 'in_progress') return 3000
  return false
}

export function useRoomsListQuery() {
  return useQuery({
    queryKey: queryKeys.rooms.list(),
    queryFn: () => roomService.getRooms(),
  })
}

export function useRoomDetailQuery(roomCode: string, options?: { polling?: boolean }) {
  const enablePolling = options?.polling ?? true
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomCode),
    queryFn: () => roomService.getRoomDetail(roomCode),
    enabled: Boolean(roomCode),
    refetchInterval: enablePolling
      ? (query) => computeAdaptiveRoomPollingInterval(query.state.data?.status)
      : false,
    refetchIntervalInBackground: false,
  })
}

export function useCreateRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRoomRequest) => roomService.createRoom(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useUpdateRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRoomRequest }) =>
      roomService.updateRoom(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => roomService.deleteRoom(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useJoinRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomCode: string) => roomService.joinRoom(roomCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useLeaveRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomCode: string) => roomService.leaveRoom(roomCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useStartRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomCode: string) => roomService.startRoom(roomCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useFinishRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomCode: string) => roomService.finishRoom(roomCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}
