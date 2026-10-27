import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { roomService } from '@/services/room.service'
import type { CreateRoomRequest, UpdateRoomRequest } from '@/types'

export function useRoomsListQuery() {
  return useQuery({
    queryKey: queryKeys.rooms.list(),
    queryFn: () => roomService.getRooms(),
  })
}

export function useRoomDetailQuery(roomCode: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomCode),
    queryFn: () => roomService.getRoomDetail(roomCode),
    enabled: Boolean(roomCode),
  })
}

export function useCreateRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRoomRequest) => roomService.createRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useUpdateRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRoomRequest }) =>
      roomService.updateRoom(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => roomService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useJoinRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomCode: string) => roomService.joinRoom(roomCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useLeaveRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomCode: string) => roomService.leaveRoom(roomCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useStartRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomCode: string) => roomService.startRoom(roomCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}

export function useFinishRoomMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomCode: string) => roomService.finishRoom(roomCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all })
    },
  })
}
