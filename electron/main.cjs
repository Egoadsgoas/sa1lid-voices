const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

app.commandLine.appendSwitch('process-per-site');
app.commandLine.appendSwitch('enable-gpu-rasterization');
function createWindow() {
  const win = new BrowserWindow({ width: 1440, height: 900, minWidth: 980, minHeight: 650, backgroundColor: '#080b14',
    titleBarStyle: 'hidden', titleBarOverlay: { color: '#00000000', symbolColor: '#ffffff' },
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: true }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
