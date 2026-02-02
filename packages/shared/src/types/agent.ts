/**
 * Agent Types - Core type definitions for the agent system
 */

export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  // Development Agents
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  MOBILE = 'mobile',
  DATABASE = 'database',
  // Quality & Operations Agents
  QA = 'qa',
  DEVOPS = 'devops',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility',
  // Design & Content Agents
  UIUX = 'uiux',
  GRAPHIC_DESIGNER = 'graphic_designer',
  // Documentation & Analysis Agents
  DOCUMENTATION = 'documentation',
  TECHNICAL_WRITER = 'technical_writer',
  PRODUCT_MANAGER = 'product_manager',
  DATA_ANALYST = 'data_analyst',
}

export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  WORKING = 'working',
  REPORTING = 'reporting',
  STUCK = 'stuck',
  BREAK = 'break',
  OFFLINE = 'offline',
}

export interface AgentCapability {
  name: string
  description: string
  tools: string[]
}

export interface AgentConfig {
  type: AgentType
  name: string
  avatar: string
  specialty: string[]
  capabilities: AgentCapability[]
  autonomyLevel: AutonomyLevel
}

export enum AutonomyLevel {
  FULL_AUTO = 'full_auto',
  SEMI_AUTO = 'semi_auto',
  MANUAL = 'manual',
  SUPERVISED = 'supervised',
}

export interface AgentState {
  id: string
  type: AgentType
  name: string
  status: AgentStatus
  currentTask: string | null
  position: { x: number; y: number }
  animation: string
  workQueue: string[] // Task IDs
  history: AgentAction[]
  config: AgentConfig
  metrics: AgentMetrics
}

export interface AgentAction {
  id: string
  type: string
  timestamp: Date
  description: string
  data: Record<string, any>
}

export interface AgentMetrics {
  tasksCompleted: number
  tasksInProgress: number
  tasksFailed: number
  averageTaskTime: number
  successRate: number
  lastActiveAt: Date
}

export interface AgentMessage {
  from: string // Agent ID
  to: string | 'broadcast' // Agent ID or broadcast
  type: MessageType
  payload: any
  timestamp: Date
  priority: MessagePriority
}

export enum MessageType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_ACCEPTED = 'task_accepted',
  TASK_REJECTED = 'task_rejected',
  PROGRESS_UPDATE = 'progress_update',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  HELP_REQUESTED = 'help_requested',
  COLLABORATION_REQUEST = 'collaboration_request',
  COLLABORATION_ACCEPTED = 'collaboration_accepted',
  QUESTION = 'question',
  ANSWER = 'answer',
  STATUS_UPDATE = 'status_update',
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}
