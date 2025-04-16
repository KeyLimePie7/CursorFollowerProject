const { app, BrowserWindow, screen, Menu, globalShortcut } = require('electron')
const path = require('path')

let overlayWindow = null
let controlWindow = null

function createWindows() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  // Create the overlay window (fullscreen transparent window)
  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    fullscreen: false,
    hasShadow: false, // for mac
    enableLargerThanScreen: true, // for mac
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Create the control window
  controlWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'Cursor Control'
  })

  // macOS specific settings
  if (process.platform === 'darwin') {
    overlayWindow.setAlwaysOnTop(true, 'screen-saver')
    overlayWindow.setVisibleOnAllWorkspaces(true)
  }

  // Load the HTML files
  overlayWindow.loadFile('index.html')
  controlWindow.loadFile('control.html')

  // Make the overlay window click-through
  overlayWindow.setIgnoreMouseEvents(true, { forward: true })

  // Remove overlay from taskbar
  overlayWindow.setSkipTaskbar(true)

  // When control window is closed, quit the app
  controlWindow.on('closed', () => {
    controlWindow = null
    overlayWindow = null
    app.quit()
  })

  // When overlay window is closed, quit the app
  overlayWindow.on('closed', () => {
    controlWindow = null
    overlayWindow = null
    app.quit()
  })
}

app.whenReady().then(createWindows)

// Add after app.whenReady().then(createWindows)
// if (process.platform === 'darwin') {
//   app.dock.hide() // Hides from dock
//   Menu.setApplicationMenu(null) // Hides menu bar
// }

app.on('window-all-closed', () => {
  app.quit()
})

// Clean up shortcuts when app quits
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})