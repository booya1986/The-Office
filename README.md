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

## 📊 Current Status

**Phase 1: Foundation - COMPLETE!** ✅ 100%

What's Working Now:
- ✅ Complete monorepo structure with 9 packages
- ✅ Comprehensive type system and shared utilities
- ✅ **Full multi-agent system with 16 specialized agents**
- ✅ Claude SDK with 20+ tools and specialized prompts
- ✅ Core services (ProjectManager, TaskManager, FileSystemManager, GitManager)
- ✅ **Interactive CLI** - Chat with agents, create projects, manage tasks
- 🚧 Visual office interface (starting Phase 2)
- 🚧 Desktop app (planned for Phase 2)

**Try It Now:**
```bash
# Initialize workspace
pixel-office init

# Chat with the Office Manager
pixel-office chat

# Create a new project
pixel-office new my-app --template react-app

# Check project status
pixel-office status
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Git
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/booya1986/The-Office.git
cd The-Office

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Set up environment
export ANTHROPIC_API_KEY=your_api_key_here
```

### Using the CLI

```bash
# Link CLI globally
pnpm --filter @pixel-office/cli link --global

# Initialize a workspace
pixel-office init

# Start chatting with the Office Manager
pixel-office chat

# Create a new project
pixel-office new my-app --template react-app

# View project status
pixel-office status

# List available agents
pixel-office agents
```

For detailed CLI documentation, see [packages/cli/README.md](./packages/cli/README.md)

## 📦 Monorepo Structure

```
pixel-office-simulator/
├── packages/
│   ├── shared/               # ✅ Shared types & utilities
│   │   └── src/
│   │       └── types/        # Agent, Task, Project, Message types
│   ├── agents/               # ✅ Agent orchestration system
│   │   └── src/
│   │       ├── base/         # BaseAgent abstract class
│   │       ├── orchestrator/ # OrchestratorAgent (Manager)
│   │       └── sub-agents/   # Frontend, Security agents
│   ├── claude-sdk/           # ✅ Claude API integration
│   │   └── src/
│   │       ├── client/       # ClaudeClient wrapper
│   │       ├── tools/        # 20+ pre-defined tools
│   │       └── prompts/      # Specialized agent prompts
│   ├── core/                 # ✅ Core business logic
│   │   └── src/
│   │       ├── project/      # ProjectManager (lifecycle, file watching)
│   │       ├── task/         # TaskManager (Kanban, pipelines)
│   │       ├── file/         # FileSystemManager (operations, history)
│   │       └── git/          # GitManager (version control)
│   ├── cli/                  # ✅ Command-line interface
│   │   └── src/
│   │       └── commands/     # init, chat, new-project, status, agents
│   ├── mcp-servers/          # 🚧 Model Context Protocol servers (planned)
│   ├── renderer/             # 🚧 Frontend UI - React + PixiJS (planned)
│   ├── desktop/              # 🚧 Electron desktop app (planned)
│   ├── plugins/              # 🚧 Plugin system (planned)
│   └── cloud-service/        # 🚧 Optional cloud backend (planned)
├── docs/                     # Documentation
│   ├── PRD.md                # ✅ Product Requirements Document
│   ├── ARCHITECTURE.md       # ✅ System architecture
│   └── CONTRIBUTING.md       # ✅ Development guidelines
├── assets/                   # 🚧 Sprites, sounds, fonts (planned)
└── scripts/                  # 🚧 Build & dev scripts (planned)

Legend: ✅ Implemented | 🚧 Planned
```

## 💡 Usage Examples

### CLI Mode (Currently Available)

#### Initialize Workspace

```bash
$ pixel-office init

┌────────────────────────────────────────┐
│  ✨ Pixel Office Initialized!          │
│                                        │
│  Created:                              │
│  • .pixeloffice/config.json            │
│  • .env.example                        │
│  • projects/                           │
└────────────────────────────────────────┘
```

#### Chat with Office Manager

```bash
$ pixel-office chat

💬 You: Create a React app with authentication

👔 Office Manager: I'll help you create a React app with authentication.
Let me break this down into tasks and assign them to the team...

📊 Creating tasks:
  1. Setup React project structure (Frontend Agent)
  2. Create authentication components (Frontend Agent)
  3. Implement auth API (Backend Agent)
  4. Security audit (Security Agent)

🔄 3 task(s) in progress...
```

#### Create New Project

```bash
$ pixel-office new my-app --template react-app

✨ Creating project: my-app
📦 Template: react-app
🎯 Setting up:
  ├─ React + TypeScript
  ├─ Vite build system
  ├─ ESLint + Prettier
  └─ Basic project structure

✅ Project created successfully!
```

#### Check Project Status

```bash
$ pixel-office status

┌─────────────────────────────────────────┐
│ 📁 Project: my-app                      │
│ 📝 A React application with TypeScript  │
└─────────────────────────────────────────┘

📊 Task Overview:
  ✅ Completed: 5
  🔄 In Progress: 2
  📋 Backlog: 1

Progress: ████████████░░░░░░░░ 60%

Tech Stack:
  • React
  • TypeScript
  • Vite
```

### Visual Office Mode (Coming in Phase 2)

When the pixel art interface is ready, you'll be able to:
- 👨‍💻 See agents working at their desks (animated typing)
- 💬 Watch agents communicating with each other
- 📊 View live Kanban board updates
- ✅ Celebrate task completions with animations
- ❌ See agents getting stuck and asking for help

## 🎨 Visual Design

- **Art Style**: Isometric 2D pixel art (16x16 or 32x32 sprites)
- **Color Palette**: Warm retro colors (browns, beiges, blues)
- **Animations**: 4-12 FPS for authentic retro feel
- **Fonts**: Pixel fonts (Press Start 2P, VT323)
- **Sound**: Optional 8-bit sound effects and lo-fi music

## 🔧 Development

### Project Statistics

- **Total Packages**: 9 (5 implemented, 4 planned)
- **Lines of Code**: ~14,000+
- **Files Created**: 62+ TypeScript files
- **Agents Implemented**: 16 specialized agents
- **Agent Prompts**: 16 custom Claude prompts
- **Task Types**: 40+ supported task types
- **Test Coverage**: TBD
- **Documentation**: 2,500+ lines

### Build All Packages

```bash
pnpm build
```

### Development Mode

```bash
# Watch mode for all packages
pnpm dev

# Work on specific package
pnpm --filter @pixel-office/cli dev
```

### Run Tests

```bash
pnpm test

# Test specific package
pnpm --filter @pixel-office/agents test
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

### Package Dependencies

```
@pixel-office/cli
  ↓
├── @pixel-office/core (ProjectManager, TaskManager, FileSystemManager, GitManager)
├── @pixel-office/agents (OrchestratorAgent, Sub-Agents)
├── @pixel-office/claude-sdk (ClaudeClient, Tools, Prompts)
└── @pixel-office/shared (Types, Constants)

@pixel-office/agents
  ↓
├── @pixel-office/claude-sdk
└── @pixel-office/shared

@pixel-office/core
  ↓
└── @pixel-office/shared
```

## 📚 Documentation

- [PRD](./PRD.md) - Full Product Requirements Document (17 sections, 1,451 lines)
- [Architecture](./ARCHITECTURE.md) - System architecture and design (comprehensive)
- [Contributing Guide](./CONTRIBUTING.md) - Development guidelines and standards
- [CLI Documentation](./packages/cli/README.md) - Complete CLI reference
- API Reference (coming soon)
- Agents Guide (coming soon)
- Plugins Guide (coming soon)

## 🔍 What's Implemented

### Packages (5/9 Complete)

#### ✅ @pixel-office/shared
Complete type definitions for the entire system:
- Agent types and states
- Task management (Kanban, Pipeline, Backlog)
- Project structure and metadata
- Message protocols between agents
- Constants and configuration

#### ✅ @pixel-office/agents
Complete multi-agent orchestration system with 16 specialized agents:

**Base & Orchestration:**
- **BaseAgent**: Abstract class with task queue, event emission, progress tracking
- **OrchestratorAgent**: Manager that coordinates all sub-agents

**Development Team (4 agents):**
- **FrontendAgent**: React, Vue, Angular, component development
- **BackendAgent**: Node.js, Express, API development, authentication
- **MobileAgent**: React Native, Expo, iOS/Android development
- **DatabaseAgent**: Schema design, migrations, Prisma, query optimization

**Quality & Operations Team (5 agents):**
- **QAAgent**: Unit/integration/E2E testing, Jest, Cypress, Playwright
- **DevOpsAgent**: CI/CD, Docker, Kubernetes, deployment automation
- **SecurityAgent**: OWASP audits, dependency scanning, vulnerability detection
- **PerformanceAgent**: Bundle optimization, profiling, Core Web Vitals
- **AccessibilityAgent**: WCAG compliance, a11y audits, screen reader testing

**Design & Content Team (2 agents):**
- **UIUXAgent**: User research, wireframes, prototypes, user flows
- **GraphicDesignerAgent**: Visual design, branding, icons, illustrations

**Documentation & Analysis Team (3 agents):**
- **TechnicalWriterAgent**: API docs, tutorials, technical documentation
- **ProductManagerAgent**: Requirements, user stories, roadmaps, PRDs
- **DataAnalystAgent**: Analytics, metrics, dashboards, data insights

#### ✅ @pixel-office/claude-sdk
Type-safe Claude API wrapper following Anthropic best practices:
- **ClaudeClient**: Message streaming, tool use, intent parsing
- **20+ Tools**: file operations, git commands, shell execution, search, testing, package management
- **Specialized Prompts**: Custom system prompts for each agent type
- Helper functions: `getToolsForAgent()`, `getPromptForAgent()`

#### ✅ @pixel-office/core
Core business logic services:
- **ProjectManager**: Create/open/close projects, file tree building, file watching with chokidar
- **TaskManager**: Task CRUD, Kanban boards with WIP limits, dependency management, pipeline execution
- **FileSystemManager**: File operations with history tracking, validation, event emission
- **GitManager**: Full Git integration using simple-git (status, commit, branch, diff, etc.)

#### ✅ @pixel-office/cli
Beautiful interactive command-line interface:
- **5 Commands**: init, chat, new-project, status, agents
- **Rich UI**: ASCII art banner, gradient colors, spinners, progress bars, boxed output
- **Full Integration**: Uses all core services and agent system
- **Error Handling**: Validation, helpful error messages, environment checking

### Key Features Working Now

1. **Agent Orchestration**: Manager parses requests, breaks into tasks, assigns to specialized agents
2. **Task Management**: Create tasks, track dependencies, manage Kanban boards, run pipelines
3. **Project Lifecycle**: Create from blueprints, watch file changes, build file trees, manage metadata
4. **Git Integration**: Full version control capabilities (commit, diff, status, branches)
5. **File Operations**: Read, write, edit, delete with history tracking and validation
6. **CLI Interface**: Beautiful terminal UI for interacting with all services
7. **Type Safety**: Complete TypeScript coverage with strict mode across all packages

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

### ✅ Phase 1: Foundation - COMPLETE! (100%)
  - [x] Monorepo structure with pnpm + Turborepo
  - [x] TypeScript configuration across all packages
  - [x] Shared type system (Agent, Task, Project, Message)
  - [x] Complete agent system (16 agents total)
    - [x] BaseAgent abstract class
    - [x] OrchestratorAgent (Manager)
    - [x] **Development Team**: Frontend, Backend, Mobile, Database
    - [x] **Quality & Ops**: QA, DevOps, Security, Performance, Accessibility
    - [x] **Design & Content**: UI/UX, Graphic Designer
    - [x] **Docs & Analysis**: Technical Writer, Product Manager, Data Analyst
  - [x] Claude SDK integration
    - [x] ClaudeClient wrapper
    - [x] 20+ pre-defined tools (file, git, shell, search, testing)
    - [x] 16 specialized agent prompts following Anthropic best practices
  - [x] Core services
    - [x] ProjectManager (lifecycle, file watching)
    - [x] TaskManager (Kanban, dependencies, pipelines)
    - [x] FileSystemManager (operations, history)
    - [x] GitManager (version control)
  - [x] Interactive CLI
    - [x] `pixel-office init` - Workspace initialization
    - [x] `pixel-office chat` - Chat with Office Manager
    - [x] `pixel-office new-project` - Project scaffolding
    - [x] `pixel-office status` - Status dashboard
    - [x] `pixel-office agents` - Agent management
  - [ ] MCP servers for tool execution (optional enhancement)

### 🚧 Phase 2: Visual Office (Q2 2026)
  - [ ] Pixel art sprite assets
  - [ ] Isometric office rendering (PixiJS)
  - [ ] Agent character animations
  - [ ] UI components (chat, Kanban, file tree)
  - [ ] Office theme system
  - [ ] Sound effects and music

### 🚧 Phase 3: Full Agent System (Q3 2026)
  - [ ] Complete all sub-agents
  - [ ] Advanced task orchestration
  - [ ] Agent-to-agent communication UI
  - [ ] Real-time collaboration features
  - [ ] Agent autonomy settings

### 🚧 Phase 4: IDE Features (Q4 2026)
  - [ ] Monaco editor integration
  - [ ] Enhanced Git UI (branches, diffs, conflicts)
  - [ ] Integrated terminal
  - [ ] Debugging interface
  - [ ] File explorer with search

### 🚧 Phase 5: Polish & Launch (Q1 2027)
  - [ ] Performance optimization
  - [ ] Plugin system implementation
  - [ ] Tutorial system
  - [ ] Achievement system
  - [ ] Public beta release

## 📞 Contact

- GitHub Issues: [https://github.com/booya1986/The-Office/issues](https://github.com/booya1986/The-Office/issues)

---

Made with ❤️ and lots of pixels