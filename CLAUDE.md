# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pixel Office Simulator is a visual IDE that replaces traditional development environments with an isometric pixel art office where AI agents work together. Users interact with an Orchestrator Agent (Manager) who coordinates specialized Sub-Agents (Frontend, Backend, QA, DevOps, etc.) to accomplish development tasks.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages (respects dependency order via Turborepo)
pnpm build

# Development mode (watch all packages)
pnpm dev

# Work on specific package
pnpm --filter @pixel-office/cli dev
pnpm --filter @pixel-office/renderer dev

# Run tests
pnpm test
pnpm --filter @pixel-office/agents test

# Type checking
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format

# Clean build artifacts
pnpm clean
```

## Architecture

### Package Dependency Graph

```
@pixel-office/cli
  └─► @pixel-office/core
  └─► @pixel-office/agents
  └─► @pixel-office/claude-sdk
  └─► @pixel-office/shared

@pixel-office/desktop
  └─► @pixel-office/renderer
  └─► @pixel-office/core
  └─► @pixel-office/agents

@pixel-office/agents
  └─► @pixel-office/claude-sdk
  └─► @pixel-office/shared

@pixel-office/core
  └─► @pixel-office/shared

@pixel-office/renderer
  └─► @pixel-office/shared
```

### Core Packages

| Package | Purpose |
|---------|---------|
| `@pixel-office/shared` | Types (Agent, Task, Project), constants, utilities - imported by all packages |
| `@pixel-office/core` | ProjectManager, TaskManager, FileSystemManager, GitManager |
| `@pixel-office/agents` | BaseAgent class + 16 specialized agents (Orchestrator + 15 Sub-Agents) |
| `@pixel-office/claude-sdk` | ClaudeClient wrapper, 20+ tools, agent prompts |
| `@pixel-office/renderer` | PixiJS office rendering, React UI components, Zustand stores, pathfinding |
| `@pixel-office/desktop` | Electron app (main/preload/renderer) |
| `@pixel-office/cli` | 5 commands: init, chat, new-project, status, agents |

### Agent System Architecture

The agent system follows an orchestration pattern:

1. **OrchestratorAgent** (Manager) receives user requests and breaks them into tasks
2. **BaseAgent** abstract class provides: task queue, event emission, progress tracking, state management
3. **Sub-Agents** (15 types) handle specialized work:
   - Development: Frontend, Backend, Mobile, Database
   - Quality & Ops: QA, DevOps, Security, Performance, Accessibility
   - Design: UI/UX, GraphicDesigner
   - Documentation: TechnicalWriter, ProductManager, DataAnalyst

### Renderer Architecture

The visual office uses a layered rendering approach:
- **OfficeRenderer**: PixiJS engine with layers (floor/furniture/agents/UI)
- **Zustand Stores**: officeStore, agentStore, uiStore for state management
- **Bridges**: AgentBridge, TaskBridge, OfficeManager for real-time data sync
- **Pathfinding**: A* algorithm with Catmull-Rom spline smoothing

## Code Conventions

### TypeScript
- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`
- ES2022 target, ESNext modules, bundler module resolution
- Export shared types from `@pixel-office/shared`

### Naming
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` (no `I` prefix)

### Code Style
- 2 spaces indentation
- Single quotes
- No semicolons (Prettier enforced)
- Arrow functions for callbacks

### Commit Messages
Follow Conventional Commits: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Scopes: agents, claude-sdk, core, renderer, desktop, shared, cli

## Environment Setup

Requires:
- Node.js 20+
- pnpm 8+
- `ANTHROPIC_API_KEY` environment variable

## Key Files

- [packages/shared/src/types/](packages/shared/src/types/) - Core type definitions (Agent, Task, Project)
- [packages/agents/src/base/BaseAgent.ts](packages/agents/src/base/BaseAgent.ts) - Base class for all agents
- [packages/agents/src/orchestrator/](packages/agents/src/orchestrator/) - Main orchestration logic
- [packages/core/src/](packages/core/src/) - ProjectManager, TaskManager, FileSystemManager, GitManager
- [packages/claude-sdk/src/tools/](packages/claude-sdk/src/tools/) - Claude tool definitions
- [packages/renderer/src/office/](packages/renderer/src/office/) - PixiJS office rendering
- [packages/renderer/src/store/](packages/renderer/src/store/) - Zustand state stores
