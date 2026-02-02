#!/usr/bin/env node

/**
 * Pixel Office CLI - Command Line Interface
 *
 * A beautiful CLI for interacting with the Pixel Office Simulator
 */

import { Command } from 'commander'
import chalk from 'chalk'
import figlet from 'figlet'
import gradient from 'gradient-string'
import { config } from 'dotenv'
import { chatCommand } from './commands/chat.js'
import { initCommand } from './commands/init.js'
import { newProjectCommand } from './commands/new-project.js'
import { statusCommand } from './commands/status.js'
import { agentsCommand } from './commands/agents.js'

// Load environment variables
config()

const program = new Command()

// ASCII Art Banner
function showBanner() {
  console.clear()
  const banner = figlet.textSync('Pixel Office', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
  })
  console.log(gradient.pastel.multiline(banner))
  console.log(
    chalk.gray('  A visual development environment with AI agent orchestration\n')
  )
}

// Program configuration
program
  .name('pixel-office')
  .description('CLI for Pixel Office Simulator - Visual Development Environment')
  .version('0.1.0')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--no-banner', 'Hide the banner')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts()
    if (opts.banner !== false) {
      showBanner()
    }
  })

// Commands
program
  .command('init')
  .description('Initialize Pixel Office in the current directory')
  .option('-p, --path <path>', 'Workspace path', process.cwd())
  .action(initCommand)

program
  .command('chat')
  .description('Start interactive chat with the Orchestration Agent')
  .option('-p, --project <path>', 'Project path')
  .action(chatCommand)

program
  .command('new-project')
  .alias('new')
  .description('Create a new project')
  .option('-n, --name <name>', 'Project name')
  .option('-t, --template <template>', 'Project template', 'react-app')
  .option('-d, --description <desc>', 'Project description')
  .action(newProjectCommand)

program
  .command('status')
  .description('Show current project and tasks status')
  .option('-p, --project <path>', 'Project path')
  .action(statusCommand)

program
  .command('agents')
  .description('List and manage agents')
  .option('-l, --list', 'List all agents')
  .option('-s, --status', 'Show agent status')
  .action(agentsCommand)

// Parse arguments
program.parse()

// Show banner if no command provided
if (!process.argv.slice(2).length) {
  showBanner()
  program.outputHelp()
}
