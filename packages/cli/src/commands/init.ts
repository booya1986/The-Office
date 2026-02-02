/**
 * Init Command - Initialize Pixel Office workspace
 */

import chalk from 'chalk'
import ora from 'ora'
import boxen from 'boxen'
import fs from 'fs/promises'
import path from 'path'

interface InitOptions {
  path: string
}

export async function initCommand(options: InitOptions) {
  const workspacePath = path.resolve(options.path)

  console.log(chalk.blue(`\n🏢 Initializing Pixel Office in: ${workspacePath}\n`))

  const spinner = ora('Creating workspace structure...').start()

  try {
    // Create .pixeloffice directory
    const configDir = path.join(workspacePath, '.pixeloffice')
    await fs.mkdir(configDir, { recursive: true })

    // Create config file
    const config = {
      version: '0.1.0',
      workspace: workspacePath,
      settings: {
        autoSave: true,
        watchFiles: true,
        maxConcurrentTasks: 5,
        officeTheme: 'modern-office',
        soundEnabled: true,
      },
      agents: {
        orchestrator: { enabled: true },
        frontend: { enabled: true },
        backend: { enabled: true },
        qa: { enabled: true },
        devops: { enabled: true },
        security: { enabled: true },
        database: { enabled: true },
        documentation: { enabled: true },
      },
    }

    await fs.writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify(config, null, 2)
    )

    // Create .env.example if it doesn't exist
    const envExample = path.join(workspacePath, '.env.example')
    try {
      await fs.access(envExample)
    } catch {
      await fs.writeFile(
        envExample,
        `# Anthropic API Key
ANTHROPIC_API_KEY=your_api_key_here

# Claude Model
CLAUDE_MODEL=claude-opus-4-5-20251101
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7

# Office Settings
MAX_AGENTS=16
ENABLE_ANIMATIONS=true
ENABLE_SOUNDS=true
`
      )
    }

    // Create projects directory
    await fs.mkdir(path.join(workspacePath, 'projects'), { recursive: true })

    spinner.succeed('Workspace initialized!')

    console.log(
      boxen(
        chalk.green.bold('✅ Pixel Office Workspace Ready!\n\n') +
          chalk.white('Configuration saved to: ') +
          chalk.cyan('.pixeloffice/config.json\n\n') +
          chalk.white('Next steps:\n') +
          chalk.gray('1. Set your ANTHROPIC_API_KEY in .env\n') +
          chalk.gray('2. Run: ') +
          chalk.cyan('pixel-office chat\n') +
          chalk.gray('3. Start building!\n'),
        {
          padding: 1,
          margin: 1,
          borderColor: 'green',
          borderStyle: 'round',
        }
      )
    )
  } catch (error) {
    spinner.fail('Initialization failed')
    console.error(
      chalk.red('Error: '),
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}
