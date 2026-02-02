/**
 * @pixel-office/claude-sdk
 *
 * Claude Code SDK wrapper for Pixel Office Simulator
 *
 * This package provides a clean interface to the Anthropic Claude API,
 * specifically designed for multi-agent software development workflows.
 *
 * Features:
 * - Type-safe Claude API client
 * - Pre-defined tools for file operations, git, testing, etc.
 * - Agent-specific system prompts following Anthropic best practices
 * - Streaming support for real-time responses
 * - Intent parsing and task breakdown
 * - Code generation and review
 *
 * @example
 * ```typescript
 * import { ClaudeClient, ALL_TOOLS, getPromptForAgent } from '@pixel-office/claude-sdk'
 *
 * const client = new ClaudeClient({
 *   apiKey: process.env.ANTHROPIC_API_KEY!
 * })
 *
 * // Send a message with tools
 * const response = await client.sendMessage(
 *   [{ role: 'user', content: 'Create a React component' }],
 *   {
 *     system: getPromptForAgent('frontend'),
 *     tools: ALL_TOOLS
 *   }
 * )
 * ```
 */

// Client
export { ClaudeClient } from './client/ClaudeClient'
export type {
  ClaudeClientConfig,
  ClaudeMessage,
  ClaudeTool,
  ClaudeResponse,
} from './client/ClaudeClient'

// Tools
export {
  ALL_TOOLS,
  FILE_TOOLS,
  GIT_TOOLS,
  SHELL_TOOLS,
  SEARCH_TOOLS,
  TESTING_TOOLS,
  PACKAGE_TOOLS,
  getToolsByCategory,
  getToolsForAgent,
} from './tools'

// Prompts
export {
  BASE_AGENT_PROMPT,
  ORCHESTRATOR_PROMPT,
  FRONTEND_AGENT_PROMPT,
  BACKEND_AGENT_PROMPT,
  SECURITY_AGENT_PROMPT,
  QA_AGENT_PROMPT,
  DEVOPS_AGENT_PROMPT,
  getPromptForAgent,
} from './prompts/agent-prompts'
