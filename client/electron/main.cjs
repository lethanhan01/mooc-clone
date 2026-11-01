const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const net = require('node:net');

const GATEWAY_HOST = process.env.GATEWAY_HOST || '127.0.0.1';
const GATEWAY_PORT = parseInt(process.env.GATEWAY_PORT || '9000', 10);
const HEADER_SIZE = 16;
const MAGIC = 0x4D43;
const VERSION = 0x01;
const OP_SERVER_BROADCAST = 0x80;

let mainWindow = null;
let tcpSocket = null;
let isConnected = false;
let seqCounter = 1;
const pendingRequests = new Map(); // seqId -> { resolve, reject, timer }
let accumulationBuffer = Buffer.alloc(0);

function connectToGateway() {
  if (tcpSocket) {
    tcpSocket.destroy();
  }

  console.log(`[ELECTRON-TCP] Connecting to C Gateway at ${GATEWAY_HOST}:${GATEWAY_PORT}...`);
  tcpSocket = new net.Socket();

  tcpSocket.connect(GATEWAY_PORT, GATEWAY_HOST, () => {
    isConnected = true;
    console.log(`[ELECTRON-TCP] Connected to C Gateway successfully.`);
  });

  tcpSocket.on('data', (chunk) => {
    accumulationBuffer = Buffer.concat([accumulationBuffer, chunk]);

    // Bóc tách từng khung tin hoàn chỉnh (TLV Framing)
    while (accumulationBuffer.length >= HEADER_SIZE) {
      const magic = accumulationBuffer.readUInt16BE(0);
      const version = accumulationBuffer.readUInt8(2);

      if (magic !== MAGIC || version !== VERSION) {
        console.error(`[ELECTRON-TCP] Protocol mismatch (magic=0x${magic.toString(16)}, ver=${version}). Disconnecting.`);
        tcpSocket.destroy();
        return;
      }

      const msgType = accumulationBuffer.readUInt8(3);
      const seqId = accumulationBuffer.readUInt32BE(4);
      const payloadLen = accumulationBuffer.readUInt32BE(12);

      const totalFrameLen = HEADER_SIZE + payloadLen;
      if (accumulationBuffer.length < totalFrameLen) {
        // Chưa nhận đủ payload, đợi chunk tiếp theo
        break;
      }

      // Đã nhận trọn vẹn 1 khung tin
      const payloadBuf = accumulationBuffer.subarray(HEADER_SIZE, totalFrameLen);
      let payloadData = null;
      try {
        if (payloadLen > 0) {
          payloadData = JSON.parse(payloadBuf.toString('utf-8'));
        }
      } catch (err) {
        console.error('[ELECTRON-TCP] Failed to parse payload JSON:', err.message);
      }

      // Xử lý gói tin
      if (msgType === OP_SERVER_BROADCAST) {
        // Server Push Broadcast -> chuyển tiếp sang React UI
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('gateway:push', payloadData);
        }
      } else {
        // Response cho một Request trước đó
        if (pendingRequests.has(seqId)) {
          const { resolve, timer } = pendingRequests.get(seqId);
          clearTimeout(timer);
          pendingRequests.delete(seqId);
          resolve(payloadData);
        }
      }

      // Cắt bỏ phần đã xử lý khỏi accumulation buffer
      accumulationBuffer = accumulationBuffer.subarray(totalFrameLen);
    }
  });

  tcpSocket.on('error', (err) => {
    console.warn(`[ELECTRON-TCP] Socket error: ${err.message}`);
  });

  tcpSocket.on('close', () => {
    isConnected = false;
    console.log('[ELECTRON-TCP] Connection closed. Retrying in 2 seconds...');
    setTimeout(() => {
      if (!app.isQuitting) {
        connectToGateway();
      }
    }, 2000);
  });
}

function sendGatewayRequest(msgType, payload = {}) {
  return new Promise((resolve, reject) => {
    if (!tcpSocket || !isConnected) {
      return reject(new Error('Chưa kết nối tới C Communication Engine (C Gateway)!'));
    }

    const seqId = seqCounter++;
    if (seqCounter > 0x7fffffff) {
      seqCounter = 1;
    }

    const jsonStr = JSON.stringify(payload);
    const payloadBuf = Buffer.from(jsonStr, 'utf-8');

    // Header 16 bytes (Big-Endian)
    const headerBuf = Buffer.alloc(HEADER_SIZE);
    headerBuf.writeUInt16BE(MAGIC, 0);
    headerBuf.writeUInt8(VERSION, 2);
    headerBuf.writeUInt8(msgType, 3);
    headerBuf.writeUInt32BE(seqId, 4);
    headerBuf.writeUInt32BE(0, 8); // client_id (C Gateway sẽ tự ghi đè)
    headerBuf.writeUInt32BE(payloadBuf.length, 12);

    const frameBuf = Buffer.concat([headerBuf, payloadBuf]);

    // Cài đặt timeout 10 giây
    const timer = setTimeout(() => {
      if (pendingRequests.has(seqId)) {
        pendingRequests.delete(seqId);
        reject(new Error(`Gateway request timeout (seq=${seqId}, msgType=0x${msgType.toString(16)})`));
      }
    }, 10000);

    pendingRequests.set(seqId, { resolve, reject, timer });
    tcpSocket.write(frameBuf);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'mooc-clone — Hệ thống Thi Trắc nghiệm Trực tuyến',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const devUrl = 'http://localhost:5173';
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl).catch(() => {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('gateway:request', async (_event, { msgType, payload }) => {
  return sendGatewayRequest(msgType, payload);
});

ipcMain.handle('gateway:status', async () => {
  return { connected: isConnected, host: GATEWAY_HOST, port: GATEWAY_PORT };
});

app.whenReady().then(() => {
  createWindow();
  connectToGateway();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

