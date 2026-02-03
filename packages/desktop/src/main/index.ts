import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'

// Electron security best practices
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let mainWindow: BrowserWindow | null = null

/**
 * Create the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Pixel Office Simulator',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false, // Don't show until ready
  })

  // Show window when ready to avoid flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    // Development: load from vite dev server
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // Production: load from built files
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Create application menu
  createMenu()
}

/**
 * Create application menu
 */
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu:new-project')
          },
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu:open-project')
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Chat Panel',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow?.webContents.send('menu:toggle-panel', 'chat')
          },
        },
        {
          label: 'Toggle Kanban Board',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow?.webContents.send('menu:toggle-panel', 'kanban')
          },
        },
        {
          label: 'Toggle File Tree',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow?.webContents.send('menu:toggle-panel', 'fileTree')
          },
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Agents',
      submenu: [
        {
          label: 'List All Agents',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            mainWindow?.webContents.send('menu:list-agents')
          },
        },
        { type: 'separator' },
        {
          label: 'Chat with Manager',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => {
            mainWindow?.webContents.send('menu:chat-manager')
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/booya1986/The-Office#readme')
          },
        },
        { type: 'separator' },
        {
          label: 'About Pixel Office',
          click: () => {
            mainWindow?.webContents.send('menu:about')
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

/**
 * IPC Handlers - Communication between main and renderer
 */
function setupIPC(): void {
  // Get app version
  ipcMain.handle('app:version', () => {
    return app.getVersion()
  })

  // Get app path
  ipcMain.handle('app:path', (_, name: string) => {
    return app.getPath(name as any)
  })

  // Minimize window
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize()
  })

  // Maximize/restore window
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.restore()
    } else {
      mainWindow?.maximize()
    }
  })

  // Close window
  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })

  // Agent communication
  ipcMain.handle('agent:send-message', async (_, message: string) => {
    // This will be connected to the OrchestratorAgent
    return { success: true, message: 'Message received' }
  })

  // Task operations
  ipcMain.handle('task:create', async (_, task: any) => {
    // This will be connected to TaskManager
    return { success: true, task }
  })
}

/**
 * App lifecycle
 */

// App ready - create window
app.whenReady().then(() => {
  setupIPC()
  createWindow()

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Cleanup before quit
app.on('before-quit', () => {
  // Cleanup resources
})
