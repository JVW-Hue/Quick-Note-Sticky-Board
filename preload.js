const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNewNote: (callback) => ipcRenderer.on('new-note', callback),
  onClearAll: (callback) => ipcRenderer.on('clear-all', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  platform: process.platform
});
