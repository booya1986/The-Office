/**
 * Task Types - Core type definitions for task management
 */

import { AgentType } from './agent'

export enum TaskType {
  // Project Setup
  PROJECT_INIT = 'project_init',
  PROJECT_CONFIG = 'project_config',

  // Development
  FEATURE_IMPLEMENTATION = 'feature_implementation',
  BUG_FIX = 'bug_fix',
  REFACTORING = 'refactoring',
  CODE_REVIEW = 'code_review',

  // Frontend
  UI_COMPONENT = 'ui_component',
  STYLING = 'styling',
  RESPONSIVE_DESIGN = 'responsive_design',

  // Backend
  API_ENDPOINT = 'api_endpoint',
  DATABASE_SCHEMA = 'database_schema',
  DATABASE_MIGRATION = 'database_migration',
  BUSINESS_LOGIC = 'business_logic',

  // Testing
  UNIT_TEST = 'unit_test',
  INTEGRATION_TEST = 'integration_test',
  E2E_TEST = 'e2e_test',
  SECURITY_AUDIT = 'security_audit',

  // DevOps
  CI_CD_SETUP = 'ci_cd_setup',
  DEPLOYMENT = 'deployment',
  INFRASTRUCTURE = 'infrastructure',

  // Documentation
  CODE_DOCUMENTATION = 'code_documentation',
  API_DOCUMENTATION = 'api_documentation',
  USER_GUIDE = 'user_guide',

  // Other
  DEPENDENCY_UPDATE = 'dependency_update',
  PERFORMANCE_OPTIMIZATION = 'performance_optimization',
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  REVIEW = 'review',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  assignedTo: AgentType | null
  dependencies: string[] // Task IDs
  blockedBy: string[] // Task IDs
  estimatedEffort: number // in minutes
  actualEffort: number // in minutes
  progress: number // 0-100
  createdAt: Date
  updatedAt: Date
  startedAt: Date | null
  completedAt: Date | null
  dueDate: Date | null
  result: TaskResult | null
  metadata: Record<string, any>
}

export interface TaskResult {
  success: boolean
  output: string
  filesChanged: string[]
  testsRun: number
  testsPassed: number
  errors: TaskError[]
  warnings: string[]
  metrics: Record<string, any>
}

export interface TaskError {
  type: string
  message: string
  file?: string
  line?: number
  column?: number
  stack?: string
}

export interface TaskBreakdown {
  parentTask: string
  subTasks: Task[]
  dependencies: TaskDependency[]
  estimatedTotalEffort: number
}

export interface TaskDependency {
  from: string // Task ID
  to: string // Task ID
  type: DependencyType
}

export enum DependencyType {
  BLOCKS = 'blocks', // From blocks To
  REQUIRES = 'requires', // From requires To to be completed first
  RELATED = 'related', // Just related, no hard dependency
}

export interface KanbanBoard {
  id: string
  name: string
  columns: KanbanColumn[]
}

export interface KanbanColumn {
  id: string
  name: string
  status: TaskStatus
  tasks: string[] // Task IDs
  limit: number | null // WIP limit
}

export interface Backlog {
  id: string
  tasks: string[] // Task IDs, ordered by priority
  totalEstimatedEffort: number
}

export interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
  status: PipelineStatus
  startedAt: Date | null
  completedAt: Date | null
}

export enum PipelineStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PipelineStage {
  id: string
  name: string
  status: PipelineStageStatus
  tasks: string[] // Task IDs
  agent: AgentType | null
  startedAt: Date | null
  completedAt: Date | null
  error: string | null
}

export enum PipelineStageStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}
