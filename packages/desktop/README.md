# @pixel-office/desktop

Electron desktop application wrapper for Pixel Office Simulator.

## Features

- **Cross-platform**: Works on macOS, Windows, and Linux
- **Native menus**: Application menus with keyboard shortcuts
- **Window management**: Minimize, maximize, close controls
- **IPC communication**: Secure communication between main and renderer processes
- **Auto-updates**: Built-in support for automatic updates (coming soon)

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Package app (creates unpacked directory)
pnpm package

# Create distributable
pnpm dist

# Platform-specific builds
pnpm dist:mac
pnpm dist:win
pnpm dist:linux
```

## Architecture

- **Main Process** (`src/main/`): Electron main process, handles window creation and native features
- **Preload Script** (`src/preload/`): Secure bridge between main and renderer processes
- **Renderer Process** (`src/renderer/`): React application using @pixel-office/renderer

## Keyboard Shortcuts

- `Cmd/Ctrl + N`: New Project
- `Cmd/Ctrl + O`: Open Project
- `Cmd/Ctrl + 1`: Toggle Chat Panel
- `Cmd/Ctrl + 2`: Toggle Kanban Board
- `Cmd/Ctrl + 3`: Toggle File Tree
- `Cmd/Ctrl + Shift + A`: List All Agents
- `Cmd/Ctrl + Shift + C`: Chat with Manager

## Building for Distribution

The app uses `electron-builder` to create installers:

- **macOS**: DMG installer with universal binary (x64 + arm64)
- **Windows**: NSIS installer (x64)
- **Linux**: AppImage and Deb packages

## License

MIT
