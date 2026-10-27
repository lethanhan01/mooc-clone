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

export type SocketEventCallback = (...args: unknown[]) => void

export interface SocketConnection {
  connected: boolean
  on(event: string, callback: SocketEventCallback): void
  off(event: string, callback: SocketEventCallback): void
}

class SocketService implements SocketConnection {
  private ws: WebSocket | null = null
  private readonly eventListeners: Map<string, Set<SocketEventCallback>> = new Map()
  public connected: boolean = false

  connect(wsUrl?: string, token?: string): SocketConnection {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return this
    }

    const defaultUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'
    const targetUrl = wsUrl || defaultUrl

    try {
      this.ws = new WebSocket(token ? `${targetUrl}?token=${encodeURIComponent(token)}` : targetUrl)

      this.ws.onopen = () => {
        this.connected = true
        this.emit('connect')
      }

      this.ws.onclose = () => {
        this.connected = false
        this.emit('disconnect')
      }

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Error occurred', err)
      }

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload?.event) {
            this.emit(payload.event, payload.data)
          }
        } catch (e) {
          console.error('[WebSocket] Failed to parse message', e)
        }
      }
    } catch (e) {
      console.warn('[WebSocket] Connection failed', e)
    }

    return this
  }

  getSocket(): SocketConnection | null {
    return this.ws ? this : null
  }

  on(event: string, callback: SocketEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  off(event: string, callback: SocketEventCallback): void {
    this.eventListeners.get(event)?.delete(callback)
  }

  private emit(event: string, ...args: unknown[]): void {
    const listeners = this.eventListeners.get(event)
    listeners?.forEach((cb) => {
      try {
        cb(...args)
      } catch (e) {
        console.error(`Error in listener for ${event}`, e)
      }
    })
  }

  private send(event: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
    }
  }

  joinRoom(roomId: string, user: { id: string; name: string }): void {
    this.send('join_room', { roomId, user })
  }

  leaveRoom(roomId: string): void {
    this.send('leave_room', { roomId })
  }

  submitAnswer(payload: UserAnswerPayload): void {
    this.send('submit_answer', payload)
  }

  submitExam(roomId: string): void {
    this.send('submit_exam', { roomId })
  }

  onTimeTick(callback: (secondsRemaining: number) => void): () => void {
    const cb = callback as unknown as SocketEventCallback
    this.on('time_tick', cb)
    return () => {
      this.off('time_tick', cb)
    }
  }

  onRoomUpdated(callback: (room: ExamRoomState) => void): () => void {
    const cb = callback as unknown as SocketEventCallback
    this.on('room_updated', cb)
    return () => {
      this.off('room_updated', cb)
    }
  }

  onExamFinished(callback: (results: { score: number; total: number }) => void): () => void {
    const cb = callback as unknown as SocketEventCallback
    this.on('exam_finished', cb)
    return () => {
      this.off('exam_finished', cb)
    }
  }


  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.connected = false
    }
  }
}

export const socketService = new SocketService()
export default socketService
