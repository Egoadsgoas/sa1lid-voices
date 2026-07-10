const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('sa1lidDesktop', Object.freeze({ platform: process.platform, version: '1.0.0' }));
