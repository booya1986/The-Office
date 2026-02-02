/**
 * Agents Command - List and manage agents
 */

import chalk from 'chalk'
import Table from 'cli-table3'
import { AgentType } from '@pixel-office/shared'

interface AgentsOptions {
  list?: boolean
  status?: boolean
}

export async function agentsCommand(options: AgentsOptions) {
  console.log(chalk.blue('\n🤖 Pixel Office Agents\n'))

  // Agent definitions
  const agents = [
    {
      type: AgentType.ORCHESTRATOR,
      name: 'Office Manager',
      icon: '👔',
      specialty: 'Project planning, task coordination, team management',
      status: 'ready',
    },
    {
      type: AgentType.FRONTEND,
      name: 'Frontend Developer',
      icon: '🎨',
      specialty: 'React, Vue, Angular, UI/UX, styling',
      status: 'ready',
    },
    {
      type: AgentType.BACKEND,
      name: 'Backend Developer',
      icon: '⚙️',
      specialty: 'Node.js, Python, APIs, databases',
      status: 'ready',
    },
    {
      type: AgentType.QA,
      name: 'QA Tester',
      icon: '🧪',
      specialty: 'Testing, automation, quality assurance',
      status: 'ready',
    },
    {
      type: AgentType.DEVOPS,
      name: 'DevOps Engineer',
      icon: '🚀',
      specialty: 'CI/CD, deployment, infrastructure',
      status: 'ready',
    },
    {
      type: AgentType.SECURITY,
      name: 'Security Specialist',
      icon: '🔒',
      specialty: 'Security audits, vulnerability scanning',
      status: 'ready',
    },
    {
      type: AgentType.DATABASE,
      name: 'Database Admin',
      icon: '🗄️',
      specialty: 'Schema design, queries, migrations',
      status: 'ready',
    },
    {
      type: AgentType.DOCUMENTATION,
      name: 'Technical Writer',
      icon: '📝',
      specialty: 'Documentation, comments, guides',
      status: 'ready',
    },
  ]

  if (options.list || !options.status) {
    const table = new Table({
      head: [
        chalk.cyan('Agent'),
        chalk.cyan('Type'),
        chalk.cyan('Specialty'),
        chalk.cyan('Status'),
      ],
      colWidths: [25, 20, 50, 12],
      wordWrap: true,
      style: { head: [], border: [] },
    })

    agents.forEach((agent) => {
      table.push([
        `${agent.icon} ${chalk.white(agent.name)}`,
        chalk.gray(agent.type),
        chalk.gray(agent.specialty),
        chalk.green('✓ Ready'),
      ])
    })

    console.log(table.toString())

    console.log(
      chalk.gray(
        '\n💡 Tip: Start a chat with ' +
          chalk.cyan('pixel-office chat') +
          ' to interact with the team!\n'
      )
    )
  }

  if (options.status) {
    console.log(chalk.bold('\n📊 Agent Status:\n'))

    agents.forEach((agent) => {
      console.log(
        `${agent.icon}  ${chalk.white(agent.name)}: ${chalk.green('● Online')} - ${chalk.gray('Idle')}`
      )
    })

    console.log(
      chalk.gray(
        '\n' + agents.length + ' agents ready and waiting for tasks.\n'
      )
    )
  }
}
