# Contributing to Pixel Office Simulator

Thank you for your interest in contributing to Pixel Office Simulator! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/The-Office.git`
3. Add upstream remote: `git remote add upstream https://github.com/booya1986/The-Office.git`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY

# Start development
pnpm dev
```

### Prerequisites

- Node.js 20+
- pnpm 8+
- Git
- Anthropic API key

## Project Structure

```
pixel-office-simulator/
├── packages/
│   ├── shared/         # Shared types and utilities
│   ├── core/           # Core business logic
│   ├── agents/         # Agent system
│   ├── claude-sdk/     # Claude API wrapper
│   ├── mcp-servers/    # MCP server implementations
│   ├── plugins/        # Plugin system
│   ├── renderer/       # React + PixiJS UI
│   ├── desktop/        # Electron app
│   └── cloud-service/  # Optional cloud backend
├── docs/               # Documentation
├── assets/             # Sprites, sounds, fonts
└── scripts/            # Build scripts
```

## Development Workflow

### 1. Choose an Issue

- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to let others know you're working on it
- Ask questions if anything is unclear

### 2. Create a Branch

```bash
git checkout -b type/description

# Examples:
git checkout -b feature/add-backend-agent
git checkout -b fix/memory-leak-in-renderer
git checkout -b docs/improve-readme
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run tests
pnpm test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Build all packages
pnpm build
```

### 5. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "type(scope): description

Detailed explanation of changes (optional)

- List key changes
- Explain why (not what)
"
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

Examples:
```bash
git commit -m "feat(agents): add backend agent implementation"
git commit -m "fix(renderer): resolve memory leak in office view"
git commit -m "docs(claude-sdk): improve API documentation"
```

### 6. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Export types from `@pixel-office/shared` when shared

**Good:**
```typescript
interface UserProfile {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<UserProfile> {
  // implementation
}
```

**Bad:**
```typescript
function getUser(id: any): Promise<any> {
  // implementation
}
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- No semicolons (enforced by Prettier)
- Use arrow functions for callbacks
- Use `const` over `let` when possible

**Good:**
```typescript
const users = await getUsers()
const activeUsers = users.filter((user) => user.isActive)
```

**Bad:**
```typescript
let users = await getUsers();
let activeUsers = users.filter(function(user) { return user.isActive; });
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Types**: `PascalCase`
- **Enums**: `PascalCase`

```typescript
// Good
class FrontendAgent { }
const API_URL = 'https://api.example.com'
interface AgentConfig { }
type TaskResult = { }
enum TaskStatus { }

// Bad
class frontend_agent { }
const apiUrl = 'https://api.example.com'
interface IAgentConfig { }
```

### Comments

- Use JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up to date

```typescript
/**
 * Execute a task assigned to this agent
 *
 * @param task - The task to execute
 * @returns Promise resolving to task result
 * @throws {Error} If task execution fails
 */
async executeTask(task: Task): Promise<TaskResult> {
  // Validate task can be handled by this agent
  // (explaining why this check is necessary)
  if (!this.canHandle(task)) {
    throw new Error('Agent cannot handle this task type')
  }

  // implementation
}
```

### Error Handling

- Use try-catch for async operations
- Create custom error classes when needed
- Provide meaningful error messages
- Log errors appropriately

```typescript
try {
  const result = await executeTask(task)
  return result
} catch (error) {
  console.error(`Task execution failed: ${error.message}`)
  throw new TaskExecutionError(
    `Failed to execute task ${task.id}`,
    { cause: error }
  )
}
```

## Commit Guidelines

### Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### Scope

The package or module affected:
- `agents`
- `claude-sdk`
- `core`
- `renderer`
- `desktop`
- `shared`
- `mcp-servers`
- `plugins`

### Subject

- Use imperative mood ("add" not "added")
- No capitalization
- No period at the end
- Max 50 characters

### Body (Optional)

- Explain what and why (not how)
- Wrap at 72 characters
- Use bullet points for multiple items

### Footer (Optional)

- Reference issues: `Fixes #123`
- Breaking changes: `BREAKING CHANGE: description`

### Examples

```
feat(agents): add backend agent with Express support

Implemented BackendAgent with support for:
- Creating REST APIs with Express
- Database integration
- Authentication middleware
- Error handling

Closes #45
```

```
fix(renderer): prevent memory leak in office view

Fixed memory leak caused by PixiJS sprites not being properly
destroyed when components unmount.

Added cleanup in useEffect hooks and proper disposal of
sprite resources.

Fixes #78
```

```
docs(claude-sdk): add comprehensive API documentation

Added detailed documentation for:
- ClaudeClient methods
- Tool definitions
- Agent prompts
- Usage examples
- Best practices
```

## Pull Request Process

### Before Submitting

1. ✅ Update your branch with latest main
2. ✅ Run all tests: `pnpm test`
3. ✅ Run type checking: `pnpm typecheck`
4. ✅ Run linting: `pnpm lint`
5. ✅ Update documentation if needed
6. ✅ Add tests for new features
7. ✅ Ensure CI passes

### PR Title

Use the same format as commit messages:
```
feat(agents): add backend agent implementation
```

### PR Description

Include:
- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How was it tested?
- **Screenshots**: If UI changes (before/after)
- **Related Issues**: `Fixes #123`, `Relates to #456`

### Template

```markdown
## What
Brief description of the changes

## Why
Explanation of why this change is needed

## How
Technical explanation of the implementation

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Before: [screenshot]
After: [screenshot]

## Related Issues
Fixes #123
Relates to #456

## Checklist
- [ ] Tests pass
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Documentation updated
- [ ] CHANGELOG updated (if user-facing)
```

### Review Process

- At least one maintainer approval required
- All CI checks must pass
- Address reviewer feedback
- Keep discussions professional and constructive

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { FrontendAgent } from '../FrontendAgent'

describe('FrontendAgent', () => {
  it('should handle UI component tasks', () => {
    const agent = new FrontendAgent('agent-1', config)
    const canHandle = agent.canHandle(uiTask)
    expect(canHandle).toBe(true)
  })
})
```

### Integration Tests

Test interactions between components:
```typescript
describe('Agent Orchestration', () => {
  it('should assign tasks to appropriate agents', async () => {
    const orchestrator = new OrchestratorAgent('orch-1', config)
    orchestrator.registerAgent(frontendAgent)

    await orchestrator.handleUserRequest('Create a React component')

    expect(frontendAgent.state.workQueue.length).toBeGreaterThan(0)
  })
})
```

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @pixel-office/agents test

# Watch mode
pnpm test:watch

# Coverage
pnpm test --coverage
```

## Documentation

### When to Update Docs

- New features
- API changes
- Configuration changes
- Bug fixes affecting behavior
- Examples and tutorials

### Where to Add Docs

- `README.md` - Package overview, quick start
- `packages/<name>/README.md` - Package-specific docs
- `docs/` - Detailed guides and tutorials
- `ARCHITECTURE.md` - System design
- Code comments - Implementation details

### Documentation Style

- Clear and concise
- Include examples
- Use code blocks with syntax highlighting
- Add images/diagrams when helpful
- Keep it up to date

## Questions?

- Open an issue with label `question`
- Join our Discord (link in README)
- Check existing documentation
- Ask in PR discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Pixel Office Simulator! 🎉
