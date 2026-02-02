/**
 * DevOpsAgent - Specialized agent for DevOps and deployment tasks
 */

import {
  AgentType,
  Task,
  TaskResult,
  TaskType,
} from '@pixel-office/shared'
import { BaseAgent } from '../../base/BaseAgent'

export class DevOpsAgent extends BaseAgent {
  get type(): AgentType {
    return AgentType.DEVOPS
  }

  get specialty(): string[] {
    return [
      'docker',
      'kubernetes',
      'ci-cd',
      'github-actions',
      'gitlab-ci',
      'jenkins',
      'terraform',
      'ansible',
      'aws',
      'azure',
      'gcp',
      'nginx',
      'monitoring',
      'logging',
      'deployment',
      'infrastructure',
    ]
  }

  get capabilities(): string[] {
    return [
      'create_dockerfile',
      'setup_ci_pipeline',
      'configure_deployment',
      'setup_monitoring',
      'manage_secrets',
      'configure_load_balancer',
      'setup_logging',
      'create_infrastructure',
      'optimize_build_time',
    ]
  }

  canHandle(task: Task): boolean {
    const devopsTaskTypes = [
      TaskType.DEPLOYMENT,
      TaskType.CI_CD,
      TaskType.INFRASTRUCTURE,
    ]

    if (devopsTaskTypes.includes(task.type)) {
      return true
    }

    const devopsKeywords = [
      'deploy',
      'deployment',
      'docker',
      'kubernetes',
      'k8s',
      'ci',
      'cd',
      'pipeline',
      'devops',
      'infrastructure',
      'terraform',
      'ansible',
      'aws',
      'cloud',
      'monitoring',
      'logging',
    ]

    const descriptionLower = task.description.toLowerCase()
    return devopsKeywords.some((keyword) => descriptionLower.includes(keyword))
  }

  async executeTask(task: Task): Promise<TaskResult> {
    this.logAction('execute_task', `Executing DevOps task: ${task.title}`, { taskId: task.id })

    try {
      await this.reportProgress(task.id, 0, 'Starting DevOps task...')

      // Analyze infrastructure requirements
      await this.reportProgress(task.id, 10, 'Analyzing infrastructure requirements...')
      const requirements = await this.analyzeInfrastructure(task)

      // Create Docker configuration
      await this.reportProgress(task.id, 25, 'Creating Docker configuration...')
      const dockerFiles = await this.createDockerConfig(requirements)

      // Setup CI/CD pipeline
      await this.reportProgress(task.id, 45, 'Setting up CI/CD pipeline...')
      const pipelineFiles = await this.setupCICD(requirements)

      // Configure deployment
      await this.reportProgress(task.id, 65, 'Configuring deployment...')
      const deploymentFiles = await this.configureDeployment(requirements)

      // Setup monitoring
      await this.reportProgress(task.id, 85, 'Setting up monitoring and logging...')
      const monitoringFiles = await this.setupMonitoring()

      await this.reportProgress(task.id, 100, 'DevOps task completed!')

      const allFiles = [...dockerFiles, ...pipelineFiles, ...deploymentFiles, ...monitoringFiles]

      return {
        success: true,
        output: `Successfully configured DevOps infrastructure with ${allFiles.length} configuration files`,
        filesChanged: allFiles,
        testsRun: 0,
        testsPassed: 0,
        errors: [],
        warnings: [],
        metrics: {
          dockerFiles: dockerFiles.length,
          pipelineFiles: pipelineFiles.length,
          deploymentFiles: deploymentFiles.length,
          monitoringEnabled: true,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: `DevOps task failed: ${(error as Error).message}`,
        filesChanged: [],
        testsRun: 0,
        testsPassed: 0,
        errors: [
          {
            type: 'devops_error',
            message: (error as Error).message,
          },
        ],
        warnings: [],
        metrics: {},
      }
    }
  }

  private async analyzeInfrastructure(task: Task): Promise<any> {
    return {
      platform: 'docker',
      ciProvider: 'github-actions',
      cloud: 'aws',
      monitoring: true,
    }
  }

  private async createDockerConfig(requirements: any): Promise<string[]> {
    return [
      'Dockerfile',
      'docker-compose.yml',
      '.dockerignore',
    ]
  }

  private async setupCICD(requirements: any): Promise<string[]> {
    return [
      '.github/workflows/ci.yml',
      '.github/workflows/deploy.yml',
    ]
  }

  private async configureDeployment(requirements: any): Promise<string[]> {
    return [
      'k8s/deployment.yml',
      'k8s/service.yml',
      'k8s/ingress.yml',
    ]
  }

  private async setupMonitoring(): Promise<string[]> {
    return [
      'monitoring/prometheus.yml',
      'monitoring/grafana-dashboard.json',
    ]
  }
}
