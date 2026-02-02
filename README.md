# 🏢 Pixel Office Simulator

> A visual development environment with pixel art office interface and AI agent orchestration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-orange.svg)](https://www.anthropic.com/)

## 🎮 What is Pixel Office Simulator?

Pixel Office Simulator is a revolutionary IDE that replaces traditional text-based development environments with an **isometric pixel art office** where AI agents work together to build your projects.

Instead of typing commands or clicking through menus, you interact with a **Manager Agent (Orchestrator)** who coordinates a team of specialized **Sub-Agents** (Frontend, Backend, QA, DevOps, Security, etc.) to accomplish your development tasks.

### Key Features

- 🎨 **Pixel Art Office Interface** - Beautiful isometric 2D environment inspired by 90s games
- 🤖 **Multi-Agent Orchestration** - Manager coordinates specialized agents
- 💬 **Natural Language Interface** - Talk to your manager like a real person
- 📊 **Visual Task Management** - Kanban boards, backlog, and pipeline visualization
- 🔧 **Full IDE Features** - Code editor, file system, Git integration, terminal
- 🎮 **Gamification** - Animations, progress indicators, achievements
- 🔌 **Plugin System** - Extend with custom agents and tools
- ☁️ **Cloud-Ready** - Optional cloud service for collaboration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│              (Pixel Art Office - PixiJS)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              ORCHESTRATION AGENT                            │
│          (Manager - Task Planning & Coordination)           │
└─┬──────┬──────┬──────┬──────┬──────┬──────┬────────────────┘
  │      │      │      │      │      │      │
  ▼      ▼      ▼      ▼      ▼      ▼      ▼
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ FE │ │ BE │ │ QA │ │DevO│ │ DB │ │Sec │ │Doc │  SUB-AGENTS
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/booya1986/The-Office.git
cd The-Office

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Start development
pnpm dev
```

### Running the Desktop App

```bash
cd packages/desktop
pnpm dev
```

## 📦 Monorepo Structure

```
pixel-office-simulator/
├── packages/
│   ├── desktop/              # Electron desktop app
│   ├── renderer/             # Frontend UI (React + PixiJS)
│   ├── core/                 # Core business logic
│   ├── agents/               # Agent orchestration system
│   ├── claude-sdk/           # Claude API integration
│   ├── mcp-servers/          # Model Context Protocol servers
│   ├── plugins/              # Plugin system
│   ├── cloud-service/        # Optional cloud backend
│   └── shared/               # Shared types & utilities
├── docs/                     # Documentation
├── assets/                   # Sprites, sounds, fonts
└── scripts/                  # Build & dev scripts
```

## 💡 Usage Examples

### Creating a New Project

Talk to your Manager:

> "Create a new React app with TypeScript and authentication"

The Manager will:
1. ✅ Analyze your request
2. ✅ Create project blueprint
3. ✅ Break down into tasks
4. ✅ Assign tasks to Frontend, Backend, Database agents
5. ✅ Coordinate their work
6. ✅ Report back when complete

### Requesting a Security Audit

> "Run a security audit on the login feature"

The Manager will:
1. ✅ Assign task to Security Agent
2. ✅ Security Agent scans for vulnerabilities
3. ✅ Reports findings to Manager
4. ✅ Manager presents results to you
5. ✅ Optionally fixes issues automatically

### Watching Agents Work

See your agents:
- 👨‍💻 Working at their desks (animated typing)
- 💬 Communicating with each other
- 📊 Updating the Kanban board
- ✅ Completing tasks with celebrations
- ❌ Getting stuck and asking for help

## 🎨 Visual Design

- **Art Style**: Isometric 2D pixel art (16x16 or 32x32 sprites)
- **Color Palette**: Warm retro colors (browns, beiges, blues)
- **Animations**: 4-12 FPS for authentic retro feel
- **Fonts**: Pixel fonts (Press Start 2P, VT323)
- **Sound**: Optional 8-bit sound effects and lo-fi music

## 🔧 Development

### Build All Packages

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

### Lint & Format

```bash
pnpm lint
pnpm format
```

### Type Check

```bash
pnpm typecheck
```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture and design
- [PRD](./PRD.md) - Full Product Requirements Document
- API Reference (coming soon)
- Agents Guide (coming soon)
- Plugins Guide (coming soon)

## 🤝 Contributing

We welcome contributions! Please see our Contributing Guide for details.

## 📄 License

MIT License - see LICENSE for details.

## 🙏 Acknowledgments

- Powered by [Claude AI](https://www.anthropic.com/) (Anthropic)
- Built with [Electron](https://www.electronjs.org/)
- Rendering with [PixiJS](https://pixijs.com/)
- Code editing with [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## 🎯 Roadmap

- [ ] Phase 1: Foundation (Q1 2026)
  - [x] Project structure
  - [x] Agent system architecture
  - [ ] Claude SDK integration
  - [ ] Basic CLI

- [ ] Phase 2: Visual Office (Q2 2026)
  - [ ] Pixel art assets
  - [ ] Office rendering
  - [ ] Agent animations
  - [ ] UI components

- [ ] Phase 3: Full Agent System (Q3 2026)
  - [ ] All sub-agents
  - [ ] Task orchestration
  - [ ] Real-time collaboration

- [ ] Phase 4: IDE Features (Q4 2026)
  - [ ] Monaco editor integration
  - [ ] Git integration
  - [ ] Terminal
  - [ ] Debugging

- [ ] Phase 5: Polish & Launch (Q1 2027)
  - [ ] Performance optimization
  - [ ] Sound & music
  - [ ] Tutorials
  - [ ] Public beta

## 📞 Contact

- GitHub Issues: [https://github.com/booya1986/The-Office/issues](https://github.com/booya1986/The-Office/issues)

---

Made with ❤️ and lots of pixels