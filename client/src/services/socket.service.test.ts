import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { socketService } from './socket.service'

class MockWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSING = 2
  readonly CLOSED = 3

  static instances: MockWebSocket[] = []
  url: string
  readyState: number = MockWebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  sentData: string[] = []

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }

  send(data: string) {
    this.sentData.push(data)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN
    if (this.onopen) {
      this.onopen(new Event('open'))
    }
  }

  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }))
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }

  simulateAbnormalClose() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { wasClean: false, code: 1006 }))
    }
  }
}

describe('SocketService with Auto-Reconnect', () => {
  const originalWebSocket = globalThis.WebSocket

  beforeEach(() => {
    vi.useFakeTimers()
    MockWebSocket.instances = []
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket
    socketService.disconnect()
  })

  afterEach(() => {
    socketService.disconnect()
    globalThis.WebSocket = originalWebSocket
    vi.useRealTimers()
  })

  it('connects to target URL with token and handles connect/disconnect events', () => {
    const onConnect = vi.fn()
    const onDisconnect = vi.fn()

    socketService.on('connect', onConnect)
    socketService.on('disconnect', onDisconnect)

    socketService.connect('ws://localhost:8080/ws', 'jwt_test_123')
    const ws = MockWebSocket.instances[0]
    expect(ws.url).toBe('ws://localhost:8080/ws?token=jwt_test_123')

    ws.simulateOpen()
    expect(socketService.connected).toBe(true)
    expect(onConnect).toHaveBeenCalledTimes(1)

    socketService.disconnect()
    expect(socketService.connected).toBe(false)
    expect(onDisconnect).toHaveBeenCalledTimes(1)
  })

  it('dispatches typed payload events correctly', () => {
    const onTimeTick = vi.fn()
    socketService.onTimeTick(onTimeTick)

    socketService.connect('ws://localhost:8080/ws')
    const ws = MockWebSocket.instances[0]
    ws.simulateOpen()

    ws.simulateMessage({ event: 'time_tick', data: 450 })
    expect(onTimeTick).toHaveBeenCalledWith(450)
  })

  it('schedules auto-reconnect on abnormal disconnect and recovers session', () => {
    const onReconnecting = vi.fn()
    const onReconnect = vi.fn()

    socketService.on('reconnecting', onReconnecting)
    socketService.on('reconnect', onReconnect)

    socketService.connect('ws://localhost:8080/ws', 'token_reconnect')
    const ws = MockWebSocket.instances[0]
    ws.simulateOpen()

    // Tham gia phòng thi
    socketService.joinRoom('ROOM_99', { id: 'u1', name: 'Thí sinh 1' })
    expect(ws.sentData).toContain(JSON.stringify({ event: 'join_room', data: { roomId: 'ROOM_99', user: { id: 'u1', name: 'Thí sinh 1' } } }))

    // Rớt mạng bất thường
    ws.simulateAbnormalClose()
    expect(socketService.connected).toBe(false)
    expect(onReconnecting).toHaveBeenCalled()

    // Chờ thời gian backoff trôi qua
    vi.advanceTimersByTime(5000)

    // WebSocket mới được tạo để kết nối lại
    expect(MockWebSocket.instances.length).toBe(2)
    const newWs = MockWebSocket.instances[1]
    expect(newWs.url).toBe('ws://localhost:8080/ws?token=token_reconnect')

    // Kết nối lại thành công -> Tự động re-join room
    newWs.simulateOpen()
    expect(socketService.connected).toBe(true)
    expect(onReconnect).toHaveBeenCalledTimes(1)
    expect(newWs.sentData).toContain(JSON.stringify({ event: 'join_room', data: { roomId: 'ROOM_99', user: { id: 'u1', name: 'Thí sinh 1' } } }))
  })

  it('manual disconnect cancels reconnect timer and cleans up state', () => {
    const onReconnecting = vi.fn()
    socketService.on('reconnecting', onReconnecting)

    socketService.connect('ws://localhost:8080/ws')
    const ws = MockWebSocket.instances[0]
    ws.simulateOpen()

    // Người dùng chủ động disconnect
    socketService.disconnect()
    expect(socketService.connected).toBe(false)

    vi.advanceTimersByTime(10000)
    // Không có kết nối mới nào được tạo
    expect(MockWebSocket.instances.length).toBe(1)
    expect(onReconnecting).not.toHaveBeenCalled()
  })
})
