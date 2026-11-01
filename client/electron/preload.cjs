const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gatewayApi', {
  request: (msgType, payload) => ipcRenderer.invoke('gateway:request', { msgType, payload }),
  getStatus: () => ipcRenderer.invoke('gateway:status'),
  onPush: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('gateway:push', handler);
    return () => ipcRenderer.removeListener('gateway:push', handler);
  },
  isDesktop: true,
});

