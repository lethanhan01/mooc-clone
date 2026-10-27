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

  // Quản lý cơ chế tự động kết nối lại (Auto-Reconnect)
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private isManuallyClosed = false

  // Ghi nhớ tham số kết nối và phòng thi để phục hồi sau rớt mạng (Auto Re-join)
  private lastWsUrl?: string
  private lastToken?: string
  private lastRoomId?: string
  private lastUser?: { id: string; name: string }

  connect(wsUrl?: string, token?: string): SocketConnection {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return this
    }

    if (wsUrl !== undefined) this.lastWsUrl = wsUrl
    if (token !== undefined) this.lastToken = token
    this.isManuallyClosed = false

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    const defaultUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'
    const targetUrl = this.lastWsUrl || defaultUrl

    try {
      if (this.ws) {
        this.ws.onopen = null
        this.ws.onclose = null
        this.ws.onerror = null
        this.ws.onmessage = null
      }

      const fullUrl = this.lastToken ? `${targetUrl}?token=${encodeURIComponent(this.lastToken)}` : targetUrl
      this.ws = new WebSocket(fullUrl)

      this.ws.onopen = () => {
        const wasReconnecting = this.reconnectAttempts > 0
        this.connected = true
        this.reconnectAttempts = 0
        this.emit('connect')

        // Khôi phục phiên phòng thi nếu vừa kết nối lại sau sự cố mất mạng
        if (wasReconnecting) {
          this.emit('reconnect')
          if (this.lastRoomId && this.lastUser) {
            this.send('join_room', { roomId: this.lastRoomId, user: this.lastUser })
          }
        }
      }

      this.ws.onclose = (event) => {
        this.connected = false
        this.emit('disconnect', event)

        if (!this.isManuallyClosed) {
          this.scheduleReconnect()
        }
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
      if (!this.isManuallyClosed) {
        this.scheduleReconnect()
      }
    }

    return this
  }

  private scheduleReconnect(): void {
    if (this.isManuallyClosed || this.reconnectTimeout) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(`[WebSocket] Max reconnect attempts (${this.maxReconnectAttempts}) reached`)
      this.emit('reconnect_failed')
      return
    }

    // Thuật toán Exponential Backoff kèm Jitter: 1s, 2s, 4s, 8s, 16s... tối đa 15s + 0-1000ms jitter
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000)
    const jitter = Math.random() * 1000
    const delay = backoff + jitter

    this.reconnectAttempts++
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay })

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null
      this.connect(this.lastWsUrl, this.lastToken)
    }, delay)
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
    this.lastRoomId = roomId
    this.lastUser = user
    this.send('join_room', { roomId, user })
  }

  leaveRoom(roomId: string): void {
    if (this.lastRoomId === roomId) {
      this.lastRoomId = undefined
      this.lastUser = undefined
    }
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
    this.isManuallyClosed = true
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.reconnectAttempts = 0
    this.lastRoomId = undefined
    this.lastUser = undefined

    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.connected = false
    }
  }
}

import { onLogout } from '@/stores/authStore'

export const socketService = new SocketService()

onLogout(() => {
  socketService.disconnect()
})

export default socketService
