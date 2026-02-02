# @pixel-office/claude-sdk

> Claude API wrapper optimized for multi-agent software development

This package provides a clean, type-safe interface to the Anthropic Claude API, specifically designed for the Pixel Office Simulator's multi-agent orchestration system.

## Features

- ✅ **Type-Safe Client** - Full TypeScript support with proper typing
- ✅ **Tool Use** - Pre-defined tools for file operations, git, testing, and more
- ✅ **Agent Prompts** - Specialized system prompts following Anthropic best practices
- ✅ **Streaming** - Real-time response streaming
- ✅ **Intent Parsing** - Natural language understanding
- ✅ **Task Breakdown** - Automatic project decomposition
- ✅ **Code Generation** - AI-powered code writing with context
- ✅ **Code Review** - Automated code analysis

## Installation

```bash
pnpm add @pixel-office/claude-sdk
```

## Quick Start

```typescript
import { ClaudeClient, getPromptForAgent, getToolsForAgent } from '@pixel-office/claude-sdk'

// Initialize client
const client = new ClaudeClient({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-opus-4-5-20251101',
  maxTokens: 4096,
  temperature: 0.7
})

// Send a message
const response = await client.sendMessage(
  [
    { role: 'user', content: 'Create a React login component' }
  ],
  {
    system: getPromptForAgent('frontend'),
    tools: getToolsForAgent('frontend')
  }
)

console.log(response.content)
```

## API Reference

### ClaudeClient

Main client for interacting with Claude API.

#### Constructor

```typescript
new ClaudeClient(config: ClaudeClientConfig)
```

**Parameters:**
- `apiKey` (required): Your Anthropic API key
- `model` (optional): Claude model to use (default: `claude-opus-4-5-20251101`)
- `maxTokens` (optional): Maximum tokens in response (default: 4096)
- `temperature` (optional): Response randomness 0-1 (default: 0.7)

#### Methods

##### `sendMessage()`

Send a message and get a response.

```typescript
await client.sendMessage(
  messages: ClaudeMessage[],
  options?: {
    system?: string
    tools?: ClaudeTool[]
    maxTokens?: number
    temperature?: number
  }
): Promise<ClaudeResponse>
```

**Example:**
```typescript
const response = await client.sendMessage(
  [
    { role: 'user', content: 'Write a function to validate email' }
  ],
  {
    system: 'You are a JavaScript expert',
    tools: FILE_TOOLS
  }
)
```

##### `streamMessage()`

Stream a response in real-time.

```typescript
for await (const chunk of client.streamMessage(messages, options)) {
  process.stdout.write(chunk)
}
```

##### `executeTask()`

Execute a development task with tools.

```typescript
const result = await client.executeTask(
  'Create a user authentication API endpoint',
  {
    projectContext: 'Node.js Express API',
    fileContext: 'src/routes/auth.ts'
  },
  getToolsForAgent('backend')
)
```

##### `parseIntent()`

Parse user intent from natural language.

```typescript
const intent = await client.parseIntent(
  'Create a new React app with authentication'
)

// Returns:
// {
//   type: 'create_project',
//   confidence: 0.95,
//   parameters: {
//     framework: 'react',
//     features: ['authentication']
//   }
// }
```

##### `generateProjectBreakdown()`

Break down a project into tasks.

```typescript
const breakdown = await client.generateProjectBreakdown(
  'E-commerce website with React and Node.js'
)

// Returns task list with assignments
```

##### `generateCode()`

Generate code for a task.

```typescript
const result = await client.generateCode(
  'Create a user registration form',
  'typescript',
  {
    framework: 'react',
    style: 'functional components with hooks'
  }
)

console.log(result.code)
console.log(result.tests)
```

##### `reviewCode()`

Review code for issues.

```typescript
const review = await client.reviewCode(
  codeToReview,
  'typescript',
  ['security', 'performance', 'best-practices']
)

console.log(review.issues)
console.log(review.summary)
```

## Tools

Pre-defined tools that Claude can use to interact with the development environment.

### Available Tool Sets

```typescript
import {
  ALL_TOOLS,        // All tools combined
  FILE_TOOLS,       // File system operations
  GIT_TOOLS,        // Git operations
  SHELL_TOOLS,      // Command execution
  SEARCH_TOOLS,     // Code search
  TESTING_TOOLS,    // Test execution
  PACKAGE_TOOLS,    // Package management
} from '@pixel-office/claude-sdk'
```

### Tool Categories

#### File Tools
- `read_file` - Read file contents
- `write_file` - Write/create files
- `edit_file` - Edit existing files
- `delete_file` - Delete files
- `list_directory` - List directory contents

#### Git Tools
- `git_status` - Get git status
- `git_diff` - Show changes
- `git_add` - Stage files
- `git_commit` - Commit changes

#### Shell Tools
- `execute_command` - Run shell commands

#### Search Tools
- `search_files` - Find files by pattern
- `search_code` - Search code content

#### Testing Tools
- `run_tests` - Execute tests

#### Package Tools
- `install_package` - Install npm packages

### Getting Tools for Agents

```typescript
import { getToolsForAgent } from '@pixel-office/claude-sdk'

const frontendTools = getToolsForAgent('frontend')
const backendTools = getToolsForAgent('backend')
const qaTools = getToolsForAgent('qa')
```

## Agent Prompts

System prompts optimized for each agent type, following Anthropic's best practices.

### Available Prompts

```typescript
import {
  BASE_AGENT_PROMPT,
  ORCHESTRATOR_PROMPT,
  FRONTEND_AGENT_PROMPT,
  BACKEND_AGENT_PROMPT,
  SECURITY_AGENT_PROMPT,
  QA_AGENT_PROMPT,
  DEVOPS_AGENT_PROMPT,
  getPromptForAgent,
} from '@pixel-office/claude-sdk'
```

### Using Prompts

```typescript
// Get prompt for a specific agent
const prompt = getPromptForAgent('frontend')

// Use in message
const response = await client.sendMessage(
  messages,
  { system: prompt }
)
```

## Best Practices

Following Anthropic's recommendations for effective AI interactions:

### 1. Clear Task Definition

❌ **Bad:**
```typescript
await client.sendMessage([
  { role: 'user', content: 'Make it work' }
])
```

✅ **Good:**
```typescript
await client.sendMessage([
  {
    role: 'user',
    content: 'Create a React functional component for a login form with email and password fields. Include form validation using React Hook Form and Zod.'
  }
], {
  system: getPromptForAgent('frontend')
})
```

### 2. Provide Context

❌ **Bad:**
```typescript
await client.generateCode('Add auth', 'typescript')
```

✅ **Good:**
```typescript
await client.generateCode(
  'Add JWT-based authentication middleware',
  'typescript',
  {
    framework: 'express',
    existingCode: currentMiddleware,
    style: 'async/await with TypeScript strict mode'
  }
)
```

### 3. Use Appropriate Tools

```typescript
// Give agents the tools they need
const response = await client.executeTask(
  taskDescription,
  context,
  getToolsForAgent(agentType) // ✅ Agent-specific tools
)
```

### 4. Handle Errors Gracefully

```typescript
try {
  const response = await client.sendMessage(messages, options)

  // Check if tool calls were made
  if (response.toolUses) {
    // Process tool calls
  }
} catch (error) {
  console.error('Claude API Error:', error.message)
  // Fallback or retry logic
}
```

### 5. Stream for Better UX

```typescript
// For long responses, stream for real-time feedback
for await (const chunk of client.streamMessage(messages)) {
  updateUI(chunk) // Show progress to user
}
```

## Examples

### Example 1: Frontend Agent Creating a Component

```typescript
const client = new ClaudeClient({ apiKey: process.env.ANTHROPIC_API_KEY! })

const task = {
  description: 'Create a user profile card component with avatar, name, email, and edit button',
  language: 'typescript',
  context: {
    framework: 'react',
    style: 'tailwindcss'
  }
}

const result = await client.generateCode(
  task.description,
  task.language,
  task.context
)

console.log('Generated component:', result.code)
console.log('Tests:', result.tests)
```

### Example 2: Security Agent Running Audit

```typescript
const securityClient = new ClaudeClient({ apiKey: process.env.ANTHROPIC_API_KEY! })

const auditResult = await securityClient.executeTask(
  'Scan the authentication module for security vulnerabilities',
  {
    projectContext: 'Node.js API with JWT auth',
    fileContext: readFileSync('./src/auth/auth.service.ts', 'utf-8')
  },
  [...FILE_TOOLS, ...SEARCH_TOOLS]
)

console.log(auditResult.response)
```

### Example 3: Orchestrator Breaking Down a Project

```typescript
const orchestrator = new ClaudeClient({ apiKey: process.env.ANTHROPIC_API_KEY! })

const breakdown = await orchestrator.generateProjectBreakdown(
  'Build a todo app with React frontend, Node.js backend, PostgreSQL database, and JWT authentication'
)

breakdown.tasks.forEach(task => {
  console.log(`${task.title} -> ${task.assignTo}`)
})
```

## TypeScript Support

Full TypeScript support with proper typing:

```typescript
import type {
  ClaudeClientConfig,
  ClaudeMessage,
  ClaudeTool,
  ClaudeResponse
} from '@pixel-office/claude-sdk'
```

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your_api_key_here

# Optional
CLAUDE_MODEL=claude-opus-4-5-20251101
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7
```

## License

MIT

## Links

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Reference](https://docs.anthropic.com/claude/reference/)
- [Best Practices for Tool Use](https://docs.anthropic.com/claude/docs/tool-use)
