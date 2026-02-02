/**
 * Status Command - Show project and tasks status
 */

import chalk from 'chalk'
import Table from 'cli-table3'
import { ProjectManager, TaskManager } from '@pixel-office/core'
import boxen from 'boxen'

interface StatusOptions {
  project?: string
}

export async function statusCommand(options: StatusOptions) {
  console.log(chalk.blue('\n📊 Project Status\n'))

  try {
    const projectManager = new ProjectManager({
      workspaceRoot: options.project || process.cwd(),
      autoSave: false,
      watchFiles: false,
    })

    const taskManager = new TaskManager()

    // Try to open project
    let project
    try {
      project = await projectManager.openProject(options.project || process.cwd())
    } catch {
      console.log(
        chalk.yellow(
          '⚠️  No Pixel Office project found in current directory.\n'
        ) + chalk.gray('Run: ') + chalk.cyan('pixel-office init') + chalk.gray(' to get started.\n')
      )
      return
    }

    // Project Info
    console.log(
      boxen(
        chalk.bold.blue('📁 Project: ') +
          chalk.white(project.name + '\n\n') +
          chalk.gray('Description: ') +
          chalk.white(project.description + '\n') +
          chalk.gray('Path: ') +
          chalk.cyan(project.rootPath + '\n') +
          chalk.gray('Created: ') +
          chalk.white(project.createdAt.toLocaleDateString() + '\n') +
          chalk.gray('Last Updated: ') +
          chalk.white(project.updatedAt.toLocaleDateString()),
        {
          padding: 1,
          borderColor: 'blue',
          borderStyle: 'round',
        }
      )
    )

    // Tech Stack
    if (Object.keys(project.techStack).length > 0) {
      console.log(chalk.bold('\n🛠️  Tech Stack:'))
      const techTable = new Table({
        head: [chalk.cyan('Category'), chalk.cyan('Technologies')],
        style: { head: [], border: [] },
      })

      Object.entries(project.techStack).forEach(([category, techs]) => {
        if (techs && techs.length > 0) {
          techTable.push([
            chalk.white(category.charAt(0).toUpperCase() + category.slice(1)),
            chalk.gray(techs.join(', ')),
          ])
        }
      })

      console.log(techTable.toString())
    }

    // Tasks Statistics
    const stats = taskManager.getStatistics()

    if (stats.total > 0) {
      console.log(chalk.bold('\n✅ Tasks Overview:'))

      const tasksTable = new Table({
        head: [chalk.cyan('Status'), chalk.cyan('Count')],
        style: { head: [], border: [] },
      })

      const statusColors: Record<string, (text: string) => string> = {
        completed: chalk.green,
        in_progress: chalk.blue,
        assigned: chalk.cyan,
        blocked: chalk.red,
        backlog: chalk.gray,
        review: chalk.yellow,
      }

      Object.entries(stats.byStatus).forEach(([status, count]) => {
        if (count > 0) {
          const color = statusColors[status] || chalk.white
          tasksTable.push([
            color(status.replace('_', ' ').toUpperCase()),
            color(count.toString()),
          ])
        }
      })

      console.log(tasksTable.toString())

      // Progress Bar
      const completionRate = stats.completionRate
      const barLength = 30
      const filled = Math.round((completionRate / 100) * barLength)
      const empty = barLength - filled
      const progressBar =
        chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))

      console.log(
        chalk.bold('\n📈 Progress: ') +
          progressBar +
          chalk.white(` ${completionRate.toFixed(1)}%`)
      )

      // Effort
      console.log(
        chalk.gray('\nEstimated Effort: ') +
          chalk.white(stats.totalEstimatedEffort + ' minutes')
      )
      console.log(
        chalk.gray('Actual Effort: ') +
          chalk.white(stats.totalActualEffort + ' minutes')
      )
    } else {
      console.log(chalk.gray('\n📋 No tasks yet. Start by chatting with the Manager!\n'))
    }

    // File Tree Summary
    const fileCount = countFiles(project.fileTree)
    console.log(
      chalk.bold('\n📂 Files: ') + chalk.white(fileCount.toString() + ' files')
    )

    console.log()

    await projectManager.shutdown()
  } catch (error) {
    console.error(
      chalk.red('Error: '),
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}

function countFiles(fileTree: any[]): number {
  let count = 0
  for (const node of fileTree) {
    if (node.type === 'file') {
      count++
    } else if (node.children) {
      count += countFiles(node.children)
    }
  }
  return count
}
