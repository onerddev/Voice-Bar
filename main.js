const { app, BrowserWindow, ipcMain, globalShortcut, screen, shell } = require('electron');
const { exec, execFile } = require('child_process');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: 440,
    height: 520,
    x: Math.round(width / 2 - 220),
    y: height - 540,
    frame: false,
    transparent: false,
    backgroundColor: '#0d0d0d',
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  try {
    globalShortcut.register('Alt+Space', () => {
      if (!mainWindow) return;
      mainWindow.isVisible() ? mainWindow.hide() : (mainWindow.show(), mainWindow.focus());
    });
  } catch(e) {}
  app.on('activate', () => { if (!mainWindow) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', () => globalShortcut.unregisterAll());

ipcMain.on('hide-window', () => { if (mainWindow) mainWindow.hide(); });
ipcMain.on('quit-app',    () => app.quit());

/* ── OPEN URL (default browser) ── */
ipcMain.handle('open-url', async (e, url) => {
  await shell.openExternal(url);
  return {ok:true};
});

/* ── OPEN IN CHROME SPECIFICALLY ── */
ipcMain.handle('open-in-chrome', async (e, url) => {
  const paths = [
    process.env.LOCALAPPDATA  + '\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) { execFile(p, [url]); return {ok:true}; }
  }
  exec(`start chrome "${url}"`);
  return {ok:true};
});

/* ── FIND AND OPEN APP ── */
ipcMain.handle('open-app', async (e, appName) => {
  const name = appName.toLowerCase().trim();

  // 1. Built-in Windows commands
  const builtins = {
    'notepad': 'notepad.exe',
    'bloco de notas': 'notepad.exe',
    'calculadora': 'calc.exe',
    'calc': 'calc.exe',
    'paint': 'mspaint.exe',
    'explorador': 'explorer.exe',
    'explorer': 'explorer.exe',
    'arquivos': 'explorer.exe',
    'cmd': 'cmd.exe',
    'terminal': 'wt.exe',
    'powershell': 'powershell.exe',
    'gerenciador de tarefas': 'taskmgr.exe',
    'task manager': 'taskmgr.exe',
    'configurações': 'ms-settings:',
    'configuracoes': 'ms-settings:',
    'word': 'winword',
    'excel': 'excel',
    'powerpoint': 'powerpnt',
    'outlook': 'outlook',
    'teams': 'ms-teams:',
    'zoom': 'zoom',
    'vscode': 'code',
    'vs code': 'code',
  };

  if (builtins[name]) {
    const cmd = builtins[name];
    if (cmd.startsWith('ms-')) {
      shell.openExternal(cmd);
    } else {
      exec(`start "" "${cmd}"`, err => {
        if (err) exec(cmd);
      });
    }
    return {ok:true};
  }

  // 2. Search common app install paths
  const searchDirs = [
    process.env.LOCALAPPDATA + '\\Programs',
    process.env.LOCALAPPDATA,
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    process.env.APPDATA,
  ].filter(Boolean);

  const keywords = name.split(' ');

  for (const dir of searchDirs) {
    try {
      const found = findExe(dir, keywords, 0);
      if (found) {
        execFile(found);
        return {ok:true, path:found};
      }
    } catch(e) {}
  }

  // 3. Try Start Menu shortcuts
  const startMenuDirs = [
    process.env.APPDATA + '\\Microsoft\\Windows\\Start Menu\\Programs',
    'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs',
  ];
  for (const dir of startMenuDirs) {
    try {
      const found = findLnk(dir, keywords);
      if (found) {
        exec(`start "" "${found}"`);
        return {ok:true, path:found};
      }
    } catch(e) {}
  }

  // 4. Last resort: try the name as a command
  exec(`start "" "${appName}"`, err => {
    if (err) exec(appName);
  });
  return {ok:true, tried:true};
});

// Recursively find .exe matching keywords (max depth 3)
function findExe(dir, keywords, depth) {
  if (depth > 3) return null;
  if (!fs.existsSync(dir)) return null;
  let entries;
  try { entries = fs.readdirSync(dir); } catch(e) { return null; }
  for (const e of entries) {
    const full = path.join(dir, e);
    const lower = e.toLowerCase();
    if (lower.endsWith('.exe') && keywords.every(k => lower.includes(k))) return full;
  }
  for (const e of entries) {
    const full = path.join(dir, e);
    try {
      if (fs.statSync(full).isDirectory()) {
        const found = findExe(full, keywords, depth+1);
        if (found) return found;
      }
    } catch(e) {}
  }
  return null;
}

// Find .lnk shortcut matching keywords
function findLnk(dir, keywords) {
  if (!fs.existsSync(dir)) return null;
  let entries;
  try { entries = fs.readdirSync(dir, {recursive:true}); } catch(e) {
    try { entries = fs.readdirSync(dir); } catch(e2) { return null; }
  }
  for (const e of (Array.isArray(entries)?entries:[])) {
    const lower = (typeof e === 'string' ? e : e.toString()).toLowerCase();
    if ((lower.endsWith('.lnk') || lower.endsWith('.exe')) && keywords.every(k => lower.includes(k))) {
      return path.join(dir, e);
    }
  }
  return null;
}

/* ── LIST INSTALLED APPS (for AI context) ── */
ipcMain.handle('list-apps', async () => {
  const dirs = [
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    process.env.LOCALAPPDATA + '\\Programs',
  ].filter(Boolean);
  const apps = new Set();
  for (const dir of dirs) {
    try {
      fs.readdirSync(dir).forEach(f => apps.add(f));
    } catch(e) {}
  }
  return Array.from(apps).slice(0, 80);
});
