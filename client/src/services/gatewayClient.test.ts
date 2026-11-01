import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gatewayClient, GATEWAY_OPCODES } from './gatewayClient';

describe('gatewayClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as { gatewayApi?: unknown }).gatewayApi;
  });

  afterEach(() => {
    (window as unknown as { gatewayApi?: unknown }).gatewayApi = {
      isDesktop: true,
      request: vi.fn().mockImplementation(() => Promise.resolve({})),
      getStatus: vi.fn().mockResolvedValue({ connected: true, host: '127.0.0.1', port: 9000 }),
      onPush: vi.fn().mockReturnValue(() => {}),
    };
  });

  it('xác định chính xác môi trường Web thuần khi không có window.gatewayApi', () => {
    delete (window as unknown as { gatewayApi?: unknown }).gatewayApi;
    expect(gatewayClient.isDesktop()).toBe(false);
  });

  it('xác định chính xác môi trường Desktop khi có window.gatewayApi', () => {
    (window as unknown as { gatewayApi: unknown }).gatewayApi = {
      isDesktop: true,
      request: vi.fn(),
      getStatus: vi.fn(),
      onPush: vi.fn(),
    };

    expect(gatewayClient.isDesktop()).toBe(true);
  });

  it('chuyển tiếp đúng Opcode và payload tới Electron IPC bridge', async () => {
    const mockRequest = vi.fn().mockResolvedValue({ token: 'mock-token-xyz' });
    (window as unknown as { gatewayApi: unknown }).gatewayApi = {
      isDesktop: true,
      request: mockRequest,
      getStatus: vi.fn(),
      onPush: vi.fn(),
    };

    const result = await gatewayClient.request(GATEWAY_OPCODES.AUTH_LOGIN_REQ, {
      username: 'student1',
      password: 'password123',
    });

    expect(mockRequest).toHaveBeenCalledWith(0x01, {
      username: 'student1',
      password: 'password123',
    });
    expect(result).toEqual({ token: 'mock-token-xyz' });
  });

  it('đăng ký và hủy bỏ listener sự kiện Server Push qua onBroadcast', () => {
    const mockUnsubscribe = vi.fn();
    const mockOnPush = vi.fn().mockReturnValue(mockUnsubscribe);

    (window as unknown as { gatewayApi: unknown }).gatewayApi = {
      isDesktop: true,
      request: vi.fn(),
      getStatus: vi.fn(),
      onPush: mockOnPush,
    };

    const handler = vi.fn();
    const unsub = gatewayClient.onBroadcast(handler);

    expect(mockOnPush).toHaveBeenCalledWith(handler);
    unsub();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
