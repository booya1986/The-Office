/**
 * Chat Command - Interactive chat with Orchestration Agent
 */

import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import { OrchestratorAgent } from '@pixel-office/agents'
import { ClaudeClient } from '@pixel-office/claude-sdk'
import { ProjectManager, TaskManager } from '@pixel-office/core'
import boxen from 'boxen'

interface ChatOptions {
  project?: string
}

export async function chatCommand(options: ChatOptions) {
  console.log(chalk.blue('🏢 Starting Pixel Office Chat...\n'))

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      boxen(
        chalk.red('⚠️  ANTHROPIC_API_KEY not found!\n\n') +
          chalk.white('Please set your API key:\n') +
          chalk.gray('export ANTHROPIC_API_KEY=your_key_here'),
        {
          padding: 1,
          borderColor: 'red',
          borderStyle: 'round',
        }
      )
    )
    process.exit(1)
  }

  // Initialize services
  const spinner = ora('Initializing Pixel Office...').start()

  try {
    const projectManager = new ProjectManager({
      workspaceRoot: options.project || process.cwd(),
      autoSave: true,
      watchFiles: false,
    })

    const taskManager = new TaskManager({
      maxConcurrentTasks: 5,
    })

    const claudeClient = new ClaudeClient({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const orchestrator = new OrchestratorAgent('orchestrator-1', {
      name: 'Office Manager',
      maxConcurrentTasks: 5,
      enableAutoPlanning: true,
      enableCollaboration: true,
    })

    spinner.succeed('Pixel Office initialized!')

    // Welcome message
    console.log(
      boxen(
        chalk.bold.blue('👔 Office Manager:') +
          '\n\n' +
          chalk.white(
            'Welcome to Pixel Office! I\'m your Office Manager.\n' +
              'I can help you create projects, manage tasks, and coordinate\n' +
              'our team of specialized agents.\n\n'
          ) +
          chalk.gray('Try saying:\n') +
          chalk.cyan('  • "Create a new React app with authentication"\n') +
          chalk.cyan('  • "Show me the current tasks"\n') +
          chalk.cyan('  • "Run a security audit on my code"\n') +
          chalk.cyan('  • "What can you help me with?"\n'),
        {
          padding: 1,
          margin: 1,
          borderColor: 'blue',
          borderStyle: 'round',
        }
      )
    )

    // Chat loop
    let chatting = true
    const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []

    while (chatting) {
      const { message } = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: chalk.green('You:'),
          prefix: '💬',
        },
      ])

      // Check for exit commands
      if (['exit', 'quit', 'bye', 'q'].includes(message.toLowerCase().trim())) {
        console.log(
          chalk.blue('\n👔 Office Manager: ') +
            chalk.white('Goodbye! Have a great day! 👋')
        )
        chatting = false
        break
      }

      if (!message.trim()) {
        continue
      }

      // Add to history
      conversationHistory.push({
        role: 'user',
        content: message,
      })

      // Show thinking
      const thinking = ora('Manager is thinking...').start()

      try {
        // Get response from orchestrator
        const response = await orchestrator.handleUserRequest(message)

        thinking.stop()

        // Display response
        console.log(
          '\n' +
            chalk.blue('👔 Office Manager: ') +
            chalk.white(response) +
            '\n'
        )

        conversationHistory.push({
          role: 'assistant',
          content: response,
        })

        // Show any active tasks
        const tasks = taskManager.getAllTasks()
        if (tasks.length > 0) {
          const inProgress = tasks.filter((t) => t.status === 'in_progress')
          if (inProgress.length > 0) {
            console.log(
              chalk.gray(
                `\n📊 ${inProgress.length} task(s) in progress...\n`
              )
            )
          }
        }
      } catch (error) {
        thinking.stop()
        console.log(
          chalk.red('\n❌ Error: ') +
            chalk.white(
              error instanceof Error ? error.message : 'Unknown error'
            ) +
            '\n'
        )
      }
    }

    // Cleanup
    await projectManager.shutdown()
    taskManager.shutdown()
  } catch (error) {
    spinner.fail('Failed to initialize')
    console.error(
      chalk.red('Error: '),
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}
