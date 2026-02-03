/**
 * Tool Definitions for Claude Agents
 *
 * These tools follow Anthropic's best practices for tool use:
 * - Clear, descriptive names
 * - Detailed descriptions explaining when and how to use the tool
 * - Well-defined input schemas with required fields
 * - Type safety with TypeScript
 */

import { ClaudeTool } from '../client/ClaudeClient'

/**
 * File System Tools
 */
export const FILE_TOOLS: ClaudeTool[] = [
  {
    name: 'read_file',
    description:
      'Read the contents of a file. Use this when you need to examine existing code or configuration files.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Absolute or relative path to the file to read',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description:
      'Write content to a file. Creates the file if it doesn\'t exist, overwrites if it does. Use this to create new files or update existing ones.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path where the file should be written',
        },
        content: {
          type: 'string',
          description: 'Content to write to the file',
        },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'edit_file',
    description:
      'Edit an existing file by replacing specific content. Use this for targeted changes rather than rewriting entire files.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to edit',
        },
        old_content: {
          type: 'string',
          description: 'Exact content to find and replace',
        },
        new_content: {
          type: 'string',
          description: 'New content to insert',
        },
      },
      required: ['path', 'old_content', 'new_content'],
    },
  },
  {
    name: 'delete_file',
    description:
      'Delete a file. Use with caution - this operation cannot be undone.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file to delete',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_directory',
    description:
      'List files and directories in a given path. Use this to explore the project structure.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the directory to list',
        },
        recursive: {
          type: 'boolean',
          description: 'Whether to list recursively (default: false)',
        },
      },
      required: ['path'],
    },
  },
]

/**
 * Git Tools
 */
export const GIT_TOOLS: ClaudeTool[] = [
  {
    name: 'git_status',
    description:
      'Get the current git status. Use this to see what files have changed.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'git_diff',
    description:
      'Get git diff for changed files. Use this to review changes before committing.',
    input_schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          description: 'Specific file to diff (optional, diffs all if not specified)',
        },
      },
    },
  },
  {
    name: 'git_add',
    description:
      'Stage files for commit. Use this before committing changes.',
    input_schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Files to stage (use "." for all)',
        },
      },
      required: ['files'],
    },
  },
  {
    name: 'git_commit',
    description:
      'Commit staged changes. Use descriptive commit messages following conventional commits format.',
    input_schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Commit message',
        },
      },
      required: ['message'],
    },
  },
]

/**
 * Shell/Command Execution Tools
 */
export const SHELL_TOOLS: ClaudeTool[] = [
  {
    name: 'execute_command',
    description:
      'Execute a shell command. Use this to run npm/pnpm commands, build tools, tests, etc. Be cautious with destructive commands.',
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Shell command to execute',
        },
        cwd: {
          type: 'string',
          description: 'Working directory (optional)',
        },
      },
      required: ['command'],
    },
  },
]

/**
 * Search Tools
 */
export const SEARCH_TOOLS: ClaudeTool[] = [
  {
    name: 'search_files',
    description:
      'Search for files matching a pattern. Use glob patterns (e.g., "**/*.ts").',
    input_schema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Glob pattern to search for',
        },
        path: {
          type: 'string',
          description: 'Directory to search in (optional, defaults to project root)',
        },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'search_code',
    description:
      'Search for code content using regex or plain text. Use this to find specific code patterns or text.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (supports regex)',
        },
        file_pattern: {
          type: 'string',
          description: 'File pattern to search in (e.g., "*.ts")',
        },
        case_sensitive: {
          type: 'boolean',
          description: 'Whether search is case sensitive (default: false)',
        },
      },
      required: ['query'],
    },
  },
]

/**
 * Testing Tools
 */
export const TESTING_TOOLS: ClaudeTool[] = [
  {
    name: 'run_tests',
    description:
      'Run tests. Use this to verify code changes work correctly.',
    input_schema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Test file pattern (optional, runs all if not specified)',
        },
        watch: {
          type: 'boolean',
          description: 'Run in watch mode',
        },
      },
    },
  },
]

/**
 * Package Management Tools
 */
export const PACKAGE_TOOLS: ClaudeTool[] = [
  {
    name: 'install_package',
    description:
      'Install an npm package. Use this when you need to add a new dependency.',
    input_schema: {
      type: 'object',
      properties: {
        package: {
          type: 'string',
          description: 'Package name (with optional version, e.g., "react@18")',
        },
        dev: {
          type: 'boolean',
          description: 'Install as dev dependency',
        },
      },
      required: ['package'],
    },
  },
]

/**
 * All tools combined
 */
export const ALL_TOOLS: ClaudeTool[] = [
  ...FILE_TOOLS,
  ...GIT_TOOLS,
  ...SHELL_TOOLS,
  ...SEARCH_TOOLS,
  ...TESTING_TOOLS,
  ...PACKAGE_TOOLS,
]

/**
 * Get tools by category
 */
export function getToolsByCategory(category: string): ClaudeTool[] {
  const toolMap: Record<string, ClaudeTool[]> = {
    file: FILE_TOOLS,
    git: GIT_TOOLS,
    shell: SHELL_TOOLS,
    search: SEARCH_TOOLS,
    testing: TESTING_TOOLS,
    package: PACKAGE_TOOLS,
    all: ALL_TOOLS,
  }

  return toolMap[category] || []
}

/**
 * Get tools for a specific agent type
 */
export function getToolsForAgent(agentType: string): ClaudeTool[] {
  const agentToolMap: Record<string, ClaudeTool[]> = {
    orchestrator: ALL_TOOLS,
    // Development Agents
    frontend: [...FILE_TOOLS, ...GIT_TOOLS, ...PACKAGE_TOOLS, ...TESTING_TOOLS],
    backend: [...FILE_TOOLS, ...GIT_TOOLS, ...PACKAGE_TOOLS, ...TESTING_TOOLS, ...SHELL_TOOLS],
    mobile: [...FILE_TOOLS, ...GIT_TOOLS, ...PACKAGE_TOOLS, ...TESTING_TOOLS],
    database: [...FILE_TOOLS, ...GIT_TOOLS, ...SHELL_TOOLS],
    // Quality & Operations Agents
    qa: [...FILE_TOOLS, ...TESTING_TOOLS, ...SEARCH_TOOLS, ...GIT_TOOLS],
    devops: [...FILE_TOOLS, ...GIT_TOOLS, ...SHELL_TOOLS, ...PACKAGE_TOOLS],
    security: [...FILE_TOOLS, ...SEARCH_TOOLS, ...SHELL_TOOLS, ...PACKAGE_TOOLS],
    performance: [...FILE_TOOLS, ...SHELL_TOOLS, ...TESTING_TOOLS, ...SEARCH_TOOLS],
    accessibility: [...FILE_TOOLS, ...TESTING_TOOLS, ...SEARCH_TOOLS],
    // Design & Content Agents
    uiux: [...FILE_TOOLS, ...SEARCH_TOOLS],
    graphic_designer: [...FILE_TOOLS, ...SEARCH_TOOLS],
    // Documentation & Analysis Agents
    documentation: [...FILE_TOOLS, ...GIT_TOOLS, ...SEARCH_TOOLS],
    technical_writer: [...FILE_TOOLS, ...GIT_TOOLS, ...SEARCH_TOOLS],
    product_manager: [...FILE_TOOLS, ...SEARCH_TOOLS],
    data_analyst: [...FILE_TOOLS, ...SHELL_TOOLS, ...SEARCH_TOOLS],
  }

  return agentToolMap[agentType] || []
}
