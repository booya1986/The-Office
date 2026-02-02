/**
 * New Project Command - Create a new project
 */

import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import { ProjectManager } from '@pixel-office/core'
import { PROJECT_TEMPLATES } from '@pixel-office/shared'
import boxen from 'boxen'

interface NewProjectOptions {
  name?: string
  template?: string
  description?: string
}

export async function newProjectCommand(options: NewProjectOptions) {
  console.log(chalk.blue('\n🏗️  Creating a new project...\n'))

  // Prompt for missing options
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      when: !options.name,
      validate: (input) => {
        if (!input.trim()) return 'Project name is required'
        if (!/^[a-z0-9-]+$/.test(input))
          return 'Use lowercase letters, numbers, and hyphens only'
        return true
      },
    },
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template:',
      when: !options.template,
      choices: [
        { name: '⚛️  React App - Modern React with TypeScript', value: 'react-app' },
        {
          name: '🚀 Full-Stack App - React + Node.js + PostgreSQL',
          value: 'fullstack-app',
        },
        { name: '📱 Mobile App - React Native', value: 'mobile-app' },
        { name: '🎨 Empty Project - Start from scratch', value: 'empty' },
      ],
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      when: !options.description,
      default: 'My awesome project',
    },
  ])

  const projectName = options.name || answers.name
  const templateId = options.template || answers.template
  const description = options.description || answers.description

  const spinner = ora('Creating project structure...').start()

  try {
    const projectManager = new ProjectManager({
      workspaceRoot: process.cwd(),
      autoSave: true,
      watchFiles: false,
    })

    // Get template
    const template = PROJECT_TEMPLATES[templateId]
    if (!template) {
      throw new Error(`Template '${templateId}' not found`)
    }

    // Create project blueprint
    const blueprint = {
      ...template.blueprint,
      name: projectName,
      description,
    }

    spinner.text = 'Generating project files...'
    const project = await projectManager.createProject(blueprint)

    spinner.succeed('Project created successfully!')

    console.log(
      boxen(
        chalk.green.bold(`✅ Project "${projectName}" created!\n\n`) +
          chalk.white('Location: ') +
          chalk.cyan(project.rootPath + '\n\n') +
          chalk.white('Template: ') +
          chalk.cyan(template.name + '\n\n') +
          chalk.white('Tech Stack:\n') +
          chalk.gray(
            Object.entries(project.techStack)
              .map(([key, values]) => `  ${key}: ${values.join(', ')}`)
              .join('\n') + '\n\n'
          ) +
          chalk.white('Next steps:\n') +
          chalk.gray(`1. cd ${projectName}\n`) +
          chalk.gray('2. pnpm install\n') +
          chalk.gray('3. pixel-office chat\n'),
        {
          padding: 1,
          margin: 1,
          borderColor: 'green',
          borderStyle: 'round',
        }
      )
    )

    await projectManager.shutdown()
  } catch (error) {
    spinner.fail('Project creation failed')
    console.error(
      chalk.red('Error: '),
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}
