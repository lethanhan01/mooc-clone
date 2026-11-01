/**
 * C Communication Engine Client Adapter
 * Cầu nối giao tiếp giữa React UI và Electron Main Process qua kênh TCP Gateway thuần.
 */

export interface GatewayApi {
  request: <T = unknown>(msgType: number, payload?: unknown) => Promise<T>;
  getStatus: () => Promise<{ connected: boolean; host: string; port: number }>;
  onPush: (callback: (data: unknown) => void) => () => void;
  isDesktop: boolean;
}

declare global {
  interface Window {
    gatewayApi?: GatewayApi;
  }
}

export const GATEWAY_OPCODES = {
  SYS_HANDSHAKE: 0x00,
  AUTH_LOGIN_REQ: 0x01,
  AUTH_LOGIN_RESP: 0x02,
  AUTH_REGISTER_REQ: 0x03,
  AUTH_REGISTER_RESP: 0x04,
  ROOM_LIST_REQ: 0x10,
  ROOM_LIST_RESP: 0x11,
  ROOM_CREATE_REQ: 0x12,
  ROOM_CREATE_RESP: 0x13,
  ROOM_JOIN_REQ: 0x14,
  ROOM_JOIN_RESP: 0x15,
  EXAM_START_REQ: 0x20,
  EXAM_START_RESP: 0x21,
  EXAM_SUBMIT_REQ: 0x22,
  EXAM_SUBMIT_RESP: 0x23,
  SERVER_BROADCAST: 0x80,
  PING: 0xfe,
  PONG: 0xff,
} as const;

export type GatewayOpcode = (typeof GATEWAY_OPCODES)[keyof typeof GATEWAY_OPCODES];

export const gatewayClient = {
  /**
   * Kiểm tra xem ứng dụng đang chạy trong môi trường Electron Desktop hay không.
   */
  isDesktop(): boolean {
    return typeof window !== 'undefined' && !!window.gatewayApi?.isDesktop;
  },

  /**
   * Gửi một yêu cầu nghiệp vụ qua C Gateway và nhận phản hồi bất đồng bộ (Request-Response).
   */
  async request<T = unknown>(msgType: number, payload: unknown = {}): Promise<T> {
    if (this.isDesktop() && window.gatewayApi) {
      return window.gatewayApi.request<T>(msgType, payload);
    }

    console.warn(
      `[GATEWAY-CLIENT] Ứng dụng đang chạy ở chế độ Web Browser thuần. Yêu cầu 0x${msgType.toString(16)} được chuyển tiếp tới Fallback Mock.`
    );
    throw new Error('Tính năng này yêu cầu kết nối qua ứng dụng Desktop (Electron + C Gateway).');
  },

  /**
   * Lắng nghe các sự kiện Server Push / Room Broadcast từ C Gateway.
   */
  onBroadcast(callback: (data: unknown) => void): () => void {
    if (this.isDesktop() && window.gatewayApi) {
      return window.gatewayApi.onPush(callback);
    }
    return () => {};
  },

  /**
   * Kiểm tra trạng thái kết nối tới C Gateway.
   */
  async getStatus(): Promise<{ connected: boolean; host: string; port: number }> {
    if (this.isDesktop() && window.gatewayApi) {
      return window.gatewayApi.getStatus();
    }
    return { connected: false, host: '127.0.0.1', port: 9000 };
  },
};

