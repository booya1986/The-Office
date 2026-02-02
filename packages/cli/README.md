# @pixel-office/cli

> Command-line interface for Pixel Office Simulator

Beautiful, interactive CLI for managing projects and chatting with AI agents in Pixel Office Simulator.

## Features

- 💬 **Interactive Chat** - Talk to the Office Manager in natural language
- 🏗️ **Project Creation** - Quick project scaffolding with templates
- 📊 **Status Dashboard** - View project and task status at a glance
- 🤖 **Agent Management** - List and monitor all available agents
- 🎨 **Beautiful UI** - Colorful, pixel-art inspired terminal interface

## Installation

```bash
# From the monorepo root
pnpm install

# Build CLI
pnpm --filter @pixel-office/cli build

# Link globally (optional)
pnpm --filter @pixel-office/cli link --global
```

## Quick Start

### 1. Initialize Workspace

```bash
pixel-office init
```

This creates:
- `.pixeloffice/config.json` - Workspace configuration
- `.env.example` - Environment variables template
- `projects/` - Directory for your projects

### 2. Set API Key

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

Or add to `.env`:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Start Chatting!

```bash
pixel-office chat
```

## Commands

### `pixel-office init`

Initialize Pixel Office workspace in the current directory.

```bash
pixel-office init
pixel-office init --path /path/to/workspace
```

**Options:**
- `-p, --path <path>` - Workspace path (default: current directory)

### `pixel-office chat`

Start interactive chat with the Orchestration Agent.

```bash
pixel-office chat
pixel-office chat --project ./my-project
```

**Options:**
- `-p, --project <path>` - Project path (default: current directory)

**Example conversation:**
```
💬 You: Create a new React app with authentication

👔 Office Manager: I'll help you create a React app with authentication.
Let me break this down into tasks and assign them to the team...

📊 3 task(s) in progress...
```

### `pixel-office new-project`

Create a new project from a template.

```bash
pixel-office new-project
pixel-office new my-app --template react-app
pixel-office new my-app -t fullstack-app -d "My awesome app"
```

**Aliases:** `new`, `new-project`

**Options:**
- `-n, --name <name>` - Project name
- `-t, --template <template>` - Template (default: react-app)
- `-d, --description <desc>` - Project description

**Available Templates:**
- `react-app` - React with TypeScript
- `fullstack-app` - React + Node.js + PostgreSQL
- `mobile-app` - React Native
- `empty` - Empty project

### `pixel-office status`

Show current project and tasks status.

```bash
pixel-office status
pixel-office status --project ./my-project
```

**Options:**
- `-p, --project <path>` - Project path

**Output:**
- Project information
- Tech stack
- Tasks overview with progress bar
- File count

### `pixel-office agents`

List and manage agents.

```bash
pixel-office agents
pixel-office agents --list
pixel-office agents --status
```

**Options:**
- `-l, --list` - List all agents
- `-s, --status` - Show agent status

## Usage Examples

### Example 1: Create a Full-Stack App

```bash
# Initialize workspace
pixel-office init

# Create new project
pixel-office new my-app --template fullstack-app

# Chat with manager
cd my-app
pixel-office chat
```

Then in chat:
```
You: Setup the project with React frontend and Express backend
Manager: I'll coordinate the frontend and backend teams...
```

### Example 2: Run Security Audit

```bash
pixel-office chat

You: Run a security audit on my authentication code
Manager: I'll assign this to the Security Agent...
```

### Example 3: Check Project Status

```bash
pixel-office status

# Output:
# 📁 Project: my-app
# ✅ Tasks Overview: 5 completed, 2 in progress
# 📈 Progress: ████████████░░░░░░░░ 60%
```

### Example 4: See Available Agents

```bash
pixel-office agents

# Output:
# 🤖 Pixel Office Agents
#
# 👔 Office Manager       orchestrator    Project planning...
# 🎨 Frontend Developer   frontend        React, Vue, Angular...
# ⚙️  Backend Developer    backend         Node.js, APIs...
# ...
```

## Interactive Chat Examples

### Creating a Feature

```
You: Add a login page with email and password fields

Manager: I'll break this down:
1. Frontend Agent: Create login component with form
2. Backend Agent: Create authentication endpoint
3. QA Agent: Write tests
4. Security Agent: Audit for security issues

Starting work...
```

### Getting Help

```
You: What can you help me with?

Manager: I can help you with:
• Creating new projects
• Building features (frontend, backend, APIs)
• Writing tests and running security audits
• Setting up CI/CD pipelines
• Generating documentation
• Managing tasks and dependencies

What would you like to work on?
```

### Checking Progress

```
You: Show me the current tasks

Manager: 📊 Current Tasks:

✅ Completed (3):
  - Setup React project
  - Create login component
  - Write unit tests

🔄 In Progress (2):
  - Implement auth API (Backend Agent - 60%)
  - Security audit (Security Agent - 30%)

📋 Backlog (1):
  - Add password reset
```

## Configuration

### Workspace Config (`.pixeloffice/config.json`)

```json
{
  "version": "0.1.0",
  "workspace": "/path/to/workspace",
  "settings": {
    "autoSave": true,
    "watchFiles": true,
    "maxConcurrentTasks": 5,
    "officeTheme": "modern-office",
    "soundEnabled": true
  },
  "agents": {
    "orchestrator": { "enabled": true },
    "frontend": { "enabled": true },
    "backend": { "enabled": true },
    "qa": { "enabled": true },
    "devops": { "enabled": true },
    "security": { "enabled": true },
    "database": { "enabled": true },
    "documentation": { "enabled": true }
  }
}
```

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your_api_key_here

# Optional
CLAUDE_MODEL=claude-opus-4-5-20251101
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7
MAX_AGENTS=16
```

## Global Options

All commands support:

```bash
-v, --verbose      Enable verbose logging
--no-banner        Hide the ASCII art banner
--help             Show help
--version          Show version
```

## Tips & Tricks

### Quick Alias

Add to your `.bashrc` or `.zshrc`:
```bash
alias po='pixel-office'
```

Then use:
```bash
po chat
po new my-app
po status
```

### Chat Exit Commands

In chat mode, type any of these to exit:
- `exit`
- `quit`
- `bye`
- `q`

### Template Customization

Templates are defined in `@pixel-office/shared/src/types/project.ts`.
You can add custom templates by extending `PROJECT_TEMPLATES`.

## Troubleshooting

### API Key Not Found

```
⚠️  ANTHROPIC_API_KEY not found!
```

**Solution:** Set your API key:
```bash
export ANTHROPIC_API_KEY=your_key_here
```

### No Project Found

```
⚠️  No Pixel Office project found in current directory.
```

**Solution:** Initialize workspace:
```bash
pixel-office init
```

### Command Not Found

```
pixel-office: command not found
```

**Solution:** Link CLI globally:
```bash
pnpm --filter @pixel-office/cli link --global
```

## Development

```bash
# Run in development mode
pnpm --filter @pixel-office/cli dev

# Build
pnpm --filter @pixel-office/cli build

# Test
pnpm --filter @pixel-office/cli test

# Lint
pnpm --filter @pixel-office/cli lint
```

## Architecture

The CLI integrates all Pixel Office packages:

```
@pixel-office/cli
    ↓
├── @pixel-office/core (ProjectManager, TaskManager)
├── @pixel-office/agents (Orchestrator, Sub-Agents)
├── @pixel-office/claude-sdk (Claude API)
└── @pixel-office/shared (Types, Constants)
```

## License

MIT
