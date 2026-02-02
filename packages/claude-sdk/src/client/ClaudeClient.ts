/**
 * ClaudeClient - Wrapper around Anthropic SDK for agent operations
 */

import Anthropic from '@anthropic-ai/sdk'
import { API_CONFIG } from '@pixel-office/shared'

export interface ClaudeClientConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
}

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeTool {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface ClaudeResponse {
  content: string
  stopReason: string | null
  usage: {
    inputTokens: number
    outputTokens: number
  }
  toolUses?: Array<{
    id: string
    name: string
    input: Record<string, any>
  }>
}

export class ClaudeClient {
  private client: Anthropic
  private config: Required<ClaudeClientConfig>

  constructor(config: ClaudeClientConfig) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model || API_CONFIG.CLAUDE_MODEL,
      maxTokens: config.maxTokens || API_CONFIG.CLAUDE_MAX_TOKENS,
      temperature: config.temperature || API_CONFIG.CLAUDE_TEMPERATURE,
    }

    this.client = new Anthropic({
      apiKey: this.config.apiKey,
    })
  }

  /**
   * Send a message to Claude and get a response
   */
  async sendMessage(
    messages: ClaudeMessage[],
    options?: {
      system?: string
      tools?: ClaudeTool[]
      maxTokens?: number
      temperature?: number
    }
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
        system: options?.system,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        tools: options?.tools as any,
      })

      // Extract text content
      const textContent = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as any).text)
        .join('\n')

      // Extract tool uses
      const toolUses = response.content
        .filter((block) => block.type === 'tool_use')
        .map((block) => {
          const toolBlock = block as any
          return {
            id: toolBlock.id,
            name: toolBlock.name,
            input: toolBlock.input,
          }
        })

      return {
        content: textContent,
        stopReason: response.stop_reason,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        toolUses: toolUses.length > 0 ? toolUses : undefined,
      }
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API Error: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Stream a response from Claude
   */
  async *streamMessage(
    messages: ClaudeMessage[],
    options?: {
      system?: string
      tools?: ClaudeTool[]
      maxTokens?: number
      temperature?: number
    }
  ): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.messages.create({
        model: this.config.model,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
        system: options?.system,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        tools: options?.tools as any,
        stream: true,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta as any
          if (delta.type === 'text_delta') {
            yield delta.text
          }
        }
      }
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API Error: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Execute a task using Claude with tools
   */
  async executeTask(
    taskDescription: string,
    context: {
      projectContext?: string
      fileContext?: string
      previousMessages?: ClaudeMessage[]
    },
    tools: ClaudeTool[]
  ): Promise<{
    response: string
    toolCalls: Array<{ name: string; input: Record<string, any> }>
  }> {
    const systemPrompt = this.buildSystemPrompt(context)

    const messages: ClaudeMessage[] = [
      ...(context.previousMessages || []),
      {
        role: 'user',
        content: taskDescription,
      },
    ]

    const response = await this.sendMessage(messages, {
      system: systemPrompt,
      tools,
    })

    return {
      response: response.content,
      toolCalls:
        response.toolUses?.map((tu) => ({
          name: tu.name,
          input: tu.input,
        })) || [],
    }
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context: {
    projectContext?: string
    fileContext?: string
  }): string {
    const parts = [
      'You are an AI software development agent working as part of a team.',
      'Your role is to complete assigned tasks efficiently and communicate clearly.',
    ]

    if (context.projectContext) {
      parts.push(`\nProject Context:\n${context.projectContext}`)
    }

    if (context.fileContext) {
      parts.push(`\nFile Context:\n${context.fileContext}`)
    }

    return parts.join('\n')
  }

  /**
   * Parse user intent from natural language
   */
  async parseIntent(userMessage: string): Promise<{
    type: string
    confidence: number
    parameters: Record<string, any>
  }> {
    const response = await this.sendMessage(
      [
        {
          role: 'user',
          content: `Parse the following user request and identify the intent:

"${userMessage}"

Respond with a JSON object containing:
- type: the intent type (e.g., "create_project", "add_feature", "fix_bug", "run_tests", "security_audit", "deploy")
- confidence: confidence score 0-1
- parameters: extracted parameters

Example:
{
  "type": "create_project",
  "confidence": 0.95,
  "parameters": {
    "name": "my-app",
    "techStack": ["react", "node"],
    "features": ["authentication"]
  }
}`,
        },
      ],
      {
        system:
          'You are an intent parser. Always respond with valid JSON only, no additional text.',
      }
    )

    try {
      return JSON.parse(response.content)
    } catch {
      // Fallback
      return {
        type: 'general_query',
        confidence: 0.5,
        parameters: { message: userMessage },
      }
    }
  }

  /**
   * Generate project breakdown
   */
  async generateProjectBreakdown(projectDescription: string): Promise<{
    tasks: Array<{
      title: string
      description: string
      type: string
      estimatedEffort: number
      assignTo: string
      dependencies: string[]
    }>
  }> {
    const response = await this.sendMessage(
      [
        {
          role: 'user',
          content: `Break down the following project into specific, actionable tasks:

"${projectDescription}"

For each task, provide:
- title: short descriptive title
- description: detailed description
- type: task type (e.g., "setup", "frontend", "backend", "testing", "deployment")
- estimatedEffort: estimated minutes
- assignTo: which agent type should handle this (frontend, backend, qa, devops, database, security, documentation)
- dependencies: array of task titles this depends on

Respond with a JSON object:
{
  "tasks": [...]
}`,
        },
      ],
      {
        system:
          'You are a project planning expert. Create comprehensive, well-organized task breakdowns. Always respond with valid JSON only.',
      }
    )

    try {
      return JSON.parse(response.content)
    } catch {
      // Fallback
      return { tasks: [] }
    }
  }

  /**
   * Generate code for a task
   */
  async generateCode(
    taskDescription: string,
    language: string,
    context?: {
      existingCode?: string
      framework?: string
      style?: string
    }
  ): Promise<{
    code: string
    explanation: string
    tests?: string
  }> {
    let prompt = `Generate ${language} code for the following task:\n\n${taskDescription}`

    if (context?.framework) {
      prompt += `\n\nFramework: ${context.framework}`
    }

    if (context?.style) {
      prompt += `\n\nStyle guide: ${context.style}`
    }

    if (context?.existingCode) {
      prompt += `\n\nExisting code to modify:\n\`\`\`${language}\n${context.existingCode}\n\`\`\``
    }

    prompt += `\n\nProvide:
1. The complete code
2. Brief explanation of the implementation
3. Test code (if applicable)

Format as JSON:
{
  "code": "...",
  "explanation": "...",
  "tests": "..." (optional)
}`

    const response = await this.sendMessage(
      [{ role: 'user', content: prompt }],
      {
        system: `You are an expert ${language} developer. Write clean, efficient, well-documented code. Always respond with valid JSON only.`,
      }
    )

    try {
      return JSON.parse(response.content)
    } catch {
      // Fallback - try to extract code blocks
      return {
        code: response.content,
        explanation: 'Code generated',
      }
    }
  }

  /**
   * Review code for issues
   */
  async reviewCode(
    code: string,
    language: string,
    checks?: string[]
  ): Promise<{
    issues: Array<{
      severity: 'error' | 'warning' | 'info'
      message: string
      line?: number
      suggestion?: string
    }>
    summary: string
  }> {
    let prompt = `Review the following ${language} code for issues:\n\n\`\`\`${language}\n${code}\n\`\`\``

    if (checks && checks.length > 0) {
      prompt += `\n\nFocus on: ${checks.join(', ')}`
    }

    prompt += `\n\nProvide a JSON response:
{
  "issues": [
    {
      "severity": "error|warning|info",
      "message": "issue description",
      "line": line_number (optional),
      "suggestion": "how to fix" (optional)
    }
  ],
  "summary": "overall assessment"
}`

    const response = await this.sendMessage(
      [{ role: 'user', content: prompt }],
      {
        system: `You are a code reviewer. Identify bugs, security issues, performance problems, and code quality issues. Always respond with valid JSON only.`,
      }
    )

    try {
      return JSON.parse(response.content)
    } catch {
      return {
        issues: [],
        summary: 'Code review completed',
      }
    }
  }
}
