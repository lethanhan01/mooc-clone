import { useEffect, useState, useCallback } from 'react'
import { socketService, type ExamRoomState } from '@/services/socket.service'
import { useAuthStore } from '@/stores/authStore'

export function useExamSocket(roomId?: string) {
  const [room, setRoom] = useState<ExamRoomState | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!roomId) return

    const socket = socketService.connect(undefined, token || undefined)

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    if (socket.connected) {
      setIsConnected(true)
    }

    if (user) {
      socketService.joinRoom(roomId, { id: user.userId, name: user.fullName })
    }

    const unsubTick = socketService.onTimeTick((time) => {
      setSecondsRemaining(time)
    })

    const unsubRoom = socketService.onRoomUpdated((updatedRoom) => {
      setRoom(updatedRoom)
      if (updatedRoom.timeRemainingSeconds !== undefined) {
        setSecondsRemaining(updatedRoom.timeRemainingSeconds)
      }
    })

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      unsubTick()
      unsubRoom()
      socketService.leaveRoom(roomId)
    }
  }, [roomId, user, token])

  const submitAnswer = useCallback(
    (questionId: string, selectedOption: string) => {
      if (!roomId) return
      socketService.submitAnswer({ roomId, questionId, selectedOption })
    },
    [roomId]
  )

  const submitExam = useCallback(() => {
    if (!roomId) return
    socketService.submitExam(roomId)
  }, [roomId])

  return {
    room,
    secondsRemaining,
    isConnected,
    submitAnswer,
    submitExam,
  }
}
