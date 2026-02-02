# Pixel Office Simulator - Architecture

## Overview
Pixel Office Simulator is a visual development environment that replaces traditional IDEs. It uses a multi-agent orchestration system with a pixel art office interface.

## High-Level Architecture

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
  │      │      │      │      │      │      │
  └──────┴──────┴──────┴──────┴──────┴──────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  CORE SERVICES                              │
│  • File System  • Git  • Build  • LSP  • MCP  • Plugins   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│               CLAUDE CODE SDK                               │
│          (Anthropic API Integration)                        │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure (Monorepo)

```
pixel-office-simulator/
├── packages/
│   ├── desktop/              # Electron desktop app
│   │   ├── src/
│   │   │   ├── main/        # Electron main process
│   │   │   ├── preload/     # Preload scripts
│   │   │   └── renderer/    # Renderer process entry
│   │   └── package.json
│   │
│   ├── renderer/             # Frontend UI (React + PixiJS)
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── office/      # Office visualization (PixiJS)
│   │   │   ├── editor/      # Code editor (Monaco)
│   │   │   ├── chat/        # Chat interface
│   │   │   └── store/       # State management (Zustand)
│   │   └── package.json
│   │
│   ├── core/                 # Core business logic
│   │   ├── src/
│   │   │   ├── project/     # Project management
│   │   │   ├── task/        # Task system
│   │   │   ├── file/        # File operations
│   │   │   ├── git/         # Git integration
│   │   │   └── state/       # Global state
│   │   └── package.json
│   │
│   ├── agents/               # Agent system
│   │   ├── src/
│   │   │   ├── orchestrator/    # Orchestration Agent
│   │   │   ├── sub-agents/      # All sub-agents
│   │   │   │   ├── frontend/
│   │   │   │   ├── backend/
│   │   │   │   ├── qa/
│   │   │   │   ├── devops/
│   │   │   │   ├── security/
│   │   │   │   ├── database/
│   │   │   │   └── documentation/
│   │   │   ├── base/            # Base agent class
│   │   │   ├── queue/           # Task queue
│   │   │   └── communication/   # Agent-to-agent protocol
│   │   └── package.json
│   │
│   ├── claude-sdk/           # Claude Code SDK wrapper
│   │   ├── src/
│   │   │   ├── client/      # API client
│   │   │   ├── tools/       # Tool definitions
│   │   │   ├── prompts/     # Prompt templates
│   │   │   └── streaming/   # Streaming responses
│   │   └── package.json
│   │
│   ├── mcp-servers/          # MCP Server implementations
│   │   ├── src/
│   │   │   ├── filesystem/  # File system MCP
│   │   │   ├── git/         # Git MCP
│   │   │   ├── search/      # Code search MCP
│   │   │   └── build/       # Build system MCP
│   │   └── package.json
│   │
│   ├── plugins/              # Plugin system
│   │   ├── src/
│   │   │   ├── core/        # Plugin engine
│   │   │   ├── api/         # Plugin API
│   │   │   └── registry/    # Plugin registry
│   │   └── package.json
│   │
│   ├── cloud-service/        # Optional cloud backend
│   │   ├── src/
│   │   │   ├── api/         # REST API
│   │   │   ├── auth/        # Authentication
│   │   │   ├── storage/     # Cloud storage
│   │   │   └── sync/        # Project sync
│   │   └── package.json
│   │
│   └── shared/               # Shared utilities & types
│       ├── src/
│       │   ├── types/       # TypeScript types
│       │   ├── constants/   # Constants
│       │   ├── utils/       # Utility functions
│       │   └── config/      # Shared configs
│       └── package.json
│
├── apps/                     # Example apps & templates
│   └── examples/
│
├── assets/                   # Static assets
│   ├── sprites/             # Pixel art sprites
│   ├── sounds/              # Sound effects
│   ├── music/               # Background music
│   └── fonts/               # Pixel fonts
│
├── docs/                     # Documentation
│   ├── architecture/
│   ├── api/
│   ├── agents/
│   └── plugins/
│
├── scripts/                  # Build & dev scripts
│   ├── build.js
│   ├── dev.js
│   └── release.js
│
├── .github/                  # GitHub workflows
│   └── workflows/
│
├── package.json              # Root package.json (workspaces)
├── pnpm-workspace.yaml       # pnpm workspaces config
├── turbo.json                # Turborepo config
├── tsconfig.json             # Root TypeScript config
├── .eslintrc.js              # ESLint config
├── .prettierrc               # Prettier config
└── README.md
```

## Technology Stack

### Frontend (Renderer)
- **Framework**: React 18
- **Game Engine**: PixiJS (isometric rendering)
- **Code Editor**: Monaco Editor
- **State**: Zustand + Immer
- **Styling**: TailwindCSS + styled-components
- **Build**: Vite

### Desktop (Electron)
- **Runtime**: Electron 28+
- **IPC**: Electron IPC + typed channels
- **Security**: Context isolation enabled

### Backend/Core
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5+
- **Agent Framework**: Custom (built on Claude SDK)
- **Queue**: BullMQ (Redis-based)
- **Database**: SQLite (local), PostgreSQL (cloud)
- **File Watching**: chokidar
- **Git**: simple-git

### AI/ML
- **LLM**: Claude API (Anthropic)
- **SDK**: @anthropic-ai/sdk
- **MCP**: Model Context Protocol
- **Streaming**: Server-Sent Events (SSE)

### Cloud (Optional)
- **API**: Fastify (Node.js)
- **Auth**: JWT + OAuth
- **Storage**: S3-compatible
- **Deployment**: Docker + K8s

## Key Components

### 1. Orchestration Agent
**Location**: `packages/agents/src/orchestrator/`

**Responsibilities:**
- Receive user requests (natural language)
- Create task breakdown and project plans
- Assign tasks to appropriate sub-agents
- Monitor progress across all agents
- Handle dependencies and blocking issues
- Synthesize results and report to user
- Manage backlog, kanban, and pipeline

**Core Files:**
```
orchestrator/
├── index.ts                 # Main orchestrator
├── planner.ts              # Task planning & breakdown
├── assigner.ts             # Task assignment logic
├── monitor.ts              # Progress monitoring
├── synthesizer.ts          # Result aggregation
└── workflow/               # Workflow management
    ├── backlog.ts          # Backlog management
    ├── kanban.ts           # Kanban board
    └── pipeline.ts         # CI/CD pipeline
```

### 2. Sub-Agents
**Location**: `packages/agents/src/sub-agents/`

Each agent follows the same pattern:

```typescript
abstract class BaseAgent {
  abstract type: AgentType
  abstract specialty: string[]
  abstract tools: Tool[]

  async receiveTask(task: Task): Promise<void>
  async executeTask(task: Task): Promise<TaskResult>
  async reportProgress(progress: Progress): Promise<void>
  async requestHelp(blocker: Blocker): Promise<void>
  async collaborate(agent: BaseAgent, task: Task): Promise<void>
}
```

**Sub-Agent Types:**
1. **Frontend Agent** - React, Vue, UI/UX
2. **Backend Agent** - Node, Python, APIs
3. **QA Agent** - Testing, automation
4. **DevOps Agent** - CI/CD, deployment
5. **Security Agent** - Security audits, vulnerability scanning
6. **Database Agent** - Schema, queries, migrations
7. **Documentation Agent** - Docs, comments, guides

### 3. Task System
**Location**: `packages/core/src/task/`

```typescript
interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  priority: Priority
  status: TaskStatus
  assignedTo: AgentType | null
  dependencies: string[]
  estimatedEffort: number
  actualEffort: number
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  result: TaskResult | null
}

enum TaskStatus {
  BACKLOG = 'backlog',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  REVIEW = 'review',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
```

### 4. Communication Protocol
**Location**: `packages/agents/src/communication/`

```typescript
interface Message {
  from: AgentId
  to: AgentId | 'broadcast'
  type: MessageType
  payload: any
  timestamp: Date
}

enum MessageType {
  TASK_ASSIGNED = 'task_assigned',
  PROGRESS_UPDATE = 'progress_update',
  TASK_COMPLETED = 'task_completed',
  HELP_REQUESTED = 'help_requested',
  COLLABORATION_REQUEST = 'collaboration_request',
  QUESTION = 'question',
  ANSWER = 'answer'
}
```

### 5. MCP Integration
**Location**: `packages/mcp-servers/`

MCP (Model Context Protocol) servers for:
- File system operations
- Git operations
- Code search and analysis
- Build and test execution

Each MCP server exposes tools that agents can use.

### 6. Plugin System
**Location**: `packages/plugins/`

```typescript
interface Plugin {
  name: string
  version: string
  author: string

  // Add custom agents
  registerAgent?(config: AgentConfig): void

  // Add custom tools
  registerTool?(tool: Tool): void

  // Add UI components
  registerUIComponent?(component: UIComponent): void

  // Lifecycle hooks
  onLoad?(): Promise<void>
  onProjectOpen?(project: Project): Promise<void>
  onAgentAction?(agent: Agent, action: Action): Promise<void>
}
```

## Data Flow

### Example: Creating a New Project

```
1. User → "Create a new React app with authentication"
   ↓
2. UI sends to Orchestration Agent
   ↓
3. Orchestration Agent:
   - Analyzes request (Claude API)
   - Creates project blueprint
   - Breaks down into tasks:
     * Setup React project structure
     * Install dependencies
     * Create auth components
     * Setup auth backend
     * Add database schema
     * Write tests
   ↓
4. Orchestration Agent assigns tasks:
   - Frontend Agent → React setup + auth UI
   - Backend Agent → Auth API endpoints
   - Database Agent → User schema + migrations
   - QA Agent → Test suite
   ↓
5. Agents work in parallel:
   - Each agent uses Claude SDK
   - Agents use MCP tools (file ops, git, etc.)
   - Agents report progress to orchestrator
   ↓
6. Orchestration Agent:
   - Monitors all agents
   - Handles dependencies
   - Resolves blockers
   ↓
7. All tasks complete → Orchestrator synthesizes
   ↓
8. Orchestrator reports to user:
   "✅ Project created! Ready to start development."
```

### Example: Security Audit Request

```
1. User → "Run security audit on the login feature"
   ↓
2. Orchestration Agent:
   - Creates security audit task
   - Assigns to Security Agent
   ↓
3. Security Agent:
   - Scans code for vulnerabilities
   - Checks dependencies (npm audit)
   - Tests for SQL injection, XSS, etc.
   - Uses security scanning tools
   ↓
4. Security Agent finds issues:
   - Reports to Orchestration Agent
   - Suggests fixes
   ↓
5. Orchestration Agent:
   - Shows findings to user
   - Offers to fix automatically or guide user
   ↓
6. User approves fixes
   ↓
7. Orchestration Agent assigns fix tasks:
   - Backend Agent → Fix SQL injection
   - Frontend Agent → Add XSS protection
   ↓
8. Agents complete fixes
   ↓
9. Security Agent re-scans
   ↓
10. All clear → Report to user
```

## State Management

### Global State (Zustand)
```typescript
interface AppState {
  // Project
  currentProject: Project | null
  projects: Project[]

  // Agents
  agents: AgentState[]
  orchestrator: OrchestratorState

  // Tasks
  backlog: Task[]
  kanban: KanbanBoard
  pipeline: Pipeline

  // UI
  officeView: OfficeViewState
  editorView: EditorViewState
  chatOpen: boolean

  // Settings
  settings: Settings
}
```

## Security

- **Sandboxing**: Agents run in isolated contexts
- **Permission System**: Explicit user approval for sensitive operations
- **Code Execution**: Safe execution in containers
- **API Keys**: Secure storage (electron-store)
- **Network**: Rate limiting, request validation

## Performance Considerations

- **Worker Threads**: Agents run in separate threads
- **Lazy Loading**: Load agents/features on demand
- **Caching**: Cache API responses, file reads
- **Debouncing**: Batch UI updates
- **Sprite Batching**: Optimize rendering

## Deployment Options

### 1. Desktop App (Recommended)
- Download Electron app
- Runs locally
- Full control over data

### 2. Cloud Service (Optional)
- Web-based version
- Remote agent execution
- Collaborative features
- Subscription-based

### 3. Self-Hosted
- Docker container
- Deploy on own infrastructure
- Full customization

## Development Workflow

1. **Monorepo** - All packages in one repo
2. **pnpm workspaces** - Shared dependencies
3. **Turborepo** - Fast builds, caching
4. **TypeScript** - Type safety across packages
5. **ESLint + Prettier** - Code quality
6. **Vitest** - Unit testing
7. **Playwright** - E2E testing
8. **GitHub Actions** - CI/CD

## Next Steps

1. ✅ Create folder structure
2. ✅ Setup package.json files
3. ✅ Configure TypeScript
4. ✅ Implement base agent class
5. ✅ Build orchestration agent
6. ✅ Create sub-agents
7. ✅ Implement MCP servers
8. ✅ Build pixel art UI
9. ✅ Integrate Monaco editor
10. ✅ Add plugin system
