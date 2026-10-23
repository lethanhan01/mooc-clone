import { io, Socket } from 'socket.io-client'

export interface ExamRoomState {
  roomId: string
  roomName: string
  status: 'waiting' | 'in_progress' | 'finished'
  timeRemainingSeconds: number
  totalQuestions: number
  participantsCount: number
}

export interface UserAnswerPayload {
  roomId: string
  questionId: string
  selectedOption: string
}

class SocketService {
  private socket: Socket | null = null

  connect(wsUrl?: string, token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    const url = wsUrl || import.meta.env.VITE_WS_URL || window.location.origin

    this.socket = io(url, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    return this.socket
  }

  getSocket(): Socket | null {
    return this.socket
  }

  joinRoom(roomId: string, user: { id: string; name: string }): void {
    this.socket?.emit('join_room', { roomId, user })
  }

  leaveRoom(roomId: string): void {
    this.socket?.emit('leave_room', { roomId })
  }

  submitAnswer(payload: UserAnswerPayload): void {
    this.socket?.emit('submit_answer', payload)
  }

  submitExam(roomId: string): void {
    this.socket?.emit('submit_exam', { roomId })
  }

  onTimeTick(callback: (secondsRemaining: number) => void): () => void {
    this.socket?.on('time_tick', callback)
    return () => {
      this.socket?.off('time_tick', callback)
    }
  }

  onRoomUpdated(callback: (room: ExamRoomState) => void): () => void {
    this.socket?.on('room_updated', callback)
    return () => {
      this.socket?.off('room_updated', callback)
    }
  }

  onExamFinished(callback: (results: { score: number; total: number }) => void): () => void {
    this.socket?.on('exam_finished', callback)
    return () => {
      this.socket?.off('exam_finished', callback)
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export const socketService = new SocketService()
export default socketService
