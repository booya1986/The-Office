# @pixel-office/renderer

Visual office interface with React and PixiJS - The pixel art environment where agents work.

## 🎮 Quick Start

### Run Demo in Browser

```bash
cd packages/renderer
pnpm install
pnpm dev
```

This will open the visual office in your browser at `http://localhost:5173`

## ✨ What You'll See

- **Isometric pixel art office** with desks, chairs, and furniture
- **6 sample agents** working in the office:
  - Office Manager (purple) - center
  - Frontend Dev (cyan) - typing
  - Backend Dev (green) - typing
  - QA Engineer (red) - thinking
  - DevOps (orange) - idle
  - UI/UX Designer (pink) - typing
- **Animated agents** that change states randomly
- **Audio controls** in top-right corner
- **Interactive camera** - drag to pan, scroll to zoom

## 🎮 Controls

- **Mouse Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out (0.5x - 2.0x)
- **Click Agent**: See agent details
- **Audio Controls**: Adjust volume and enable/disable sounds

## 🏗️ Architecture

```
renderer/
├── src/
│   ├── office/          # PixiJS rendering engine
│   │   ├── OfficeRenderer.ts    # Main renderer
│   │   └── sprites/             # Agent & furniture sprites
│   ├── components/      # React UI components
│   │   ├── PixelOffice.tsx     # Main component
│   │   ├── OfficeCanvas.tsx    # Canvas wrapper
│   │   └── ui/                 # UI panels
│   ├── store/          # Zustand state management
│   │   ├── officeStore.ts
│   │   ├── agentStore.ts
│   │   └── uiStore.ts
│   ├── services/       # Data bridges
│   │   ├── AgentBridge.ts
│   │   ├── TaskBridge.ts
│   │   └── OfficeManager.ts
│   ├── pathfinding/    # A* pathfinding
│   │   ├── AStar.ts
│   │   ├── PathSmoother.ts
│   │   ├── GridManager.ts
│   │   └── AgentMovementController.ts
│   ├── audio/          # Sound system
│   │   ├── SoundGenerator.ts
│   │   ├── SoundManager.ts
│   │   └── AudioProvider.tsx
│   └── styles/         # CSS
└── demo.tsx           # Demo application
```

## 🎨 Features

### Rendering
- ✅ PixiJS 7.3.2 with pixel-perfect rendering
- ✅ Layered architecture (floor/furniture/agents/UI)
- ✅ 32px isometric tiles
- ✅ 60fps animations
- ✅ Camera controls (pan, zoom, follow)

### Agents
- ✅ 16 unique color-coded agent types
- ✅ Animations: idle, typing, thinking, celebrating
- ✅ Status indicators
- ✅ Name labels

### UI
- ✅ ChatPanel - Agent communication
- ✅ KanbanBoard - Task visualization
- ✅ FileTreePanel - File explorer
- ✅ StatusBar - Stats display

### Audio
- ✅ 8-bit sound effects (14 types)
- ✅ Background music support
- ✅ Volume controls
- ✅ Settings persistence

### Pathfinding
- ✅ A* algorithm
- ✅ Path smoothing (Catmull-Rom)
- ✅ Obstacle avoidance
- ✅ Smooth movement

## 🔌 Integration

To integrate with real data:

```tsx
import { PixelOffice } from '@pixel-office/renderer'
import { officeManager } from '@pixel-office/renderer/services'

// Connect to core services
officeManager.connectToCore({
  orchestrator: orchestratorAgent,
  taskManager: taskManager,
  projectManager: projectManager,
})

// Render
<PixelOffice
  projectPath="/your/project"
  onReady={() => console.log('Ready!')}
  coreServices={{
    orchestrator: orchestratorAgent,
    taskManager: taskManager,
    projectManager: projectManager,
  }}
/>
```

## 📦 Build

```bash
# Development
pnpm dev

# Production build
pnpm build

# Type check
pnpm typecheck
```

## 🎯 Agent Colors

- **Orchestrator**: Purple (#4f46e5)
- **Frontend**: Cyan (#06b6d4)
- **Backend**: Green (#10b981)
- **Mobile**: Purple (#8b5cf6)
- **Database**: Yellow (#f59e0b)
- **QA**: Red (#ef4444)
- **DevOps**: Orange (#f97316)
- **Security**: Red (#dc2626)
- **Performance**: Amber (#d97706)
- **Accessibility**: Blue (#3b82f6)
- **UI/UX**: Pink (#ec4899)
- **Graphic Designer**: Fuchsia (#d946ef)
- **Technical Writer**: Sky (#0ea5e9)
- **Product Manager**: Indigo (#6366f1)
- **Data Analyst**: Violet (#7c3aed)
- **Documentation**: Gray (#6b7280)

## 🎵 Sound Effects

- Agent: spawn, typing, thinking, complete, error, celebrate
- Task: created, started, completed, failed
- UI: panel open/close, button click, notification
- Ambient: keyboard, coffee, paper

## License

MIT
