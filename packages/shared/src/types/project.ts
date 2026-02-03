/**
 * Project Types - Core type definitions for project management
 */

import { Task, KanbanBoard, Backlog, Pipeline } from './task'

export interface Project {
  id: string
  name: string
  description: string
  rootPath: string
  techStack: TechStack
  framework: string | null
  language: string[]
  createdAt: Date
  updatedAt: Date
  lastOpenedAt: Date
  metadata: ProjectMetadata
  gitConfig: GitConfig | null
  fileTree: FileNode[]
  agents: string[] // Agent IDs active in this project
  tasks: string[] // Task IDs
  kanban: KanbanBoard | null
  backlog: Backlog | null
  pipeline: Pipeline | null
  settings: ProjectSettings
}

export interface TechStack {
  frontend?: string[] // e.g., ['react', 'typescript', 'tailwindcss']
  backend?: string[] // e.g., ['node', 'express', 'postgresql']
  database?: string[] // e.g., ['postgresql', 'redis']
  infrastructure?: string[] // e.g., ['docker', 'kubernetes', 'aws']
  tools?: string[] // e.g., ['webpack', 'vite', 'eslint']
}

export interface ProjectMetadata {
  author: string
  version: string
  license: string
  repository?: string
  homepage?: string
  tags: string[]
  customData: Record<string, any>
}

export interface GitConfig {
  remote: string
  branch: string
  lastCommit: string
  status: GitStatus
}

export enum GitStatus {
  CLEAN = 'clean',
  MODIFIED = 'modified',
  STAGED = 'staged',
  CONFLICTED = 'conflicted',
}

export interface FileNode {
  path: string
  name: string
  type: 'file' | 'directory'
  size: number
  extension?: string
  children?: FileNode[]
  lastModified: Date
  isGitIgnored: boolean
  gitStatus?: 'added' | 'modified' | 'deleted' | 'untracked'
}

export interface ProjectSettings {
  autoSave: boolean
  autoFormat: boolean
  lintOnSave: boolean
  testOnSave: boolean
  officeTheme: string
  soundEnabled: boolean
  musicVolume: number
  notificationsEnabled: boolean
  agentAutonomy: {
    [key: string]: string // AgentType -> AutonomyLevel
  }
}

export interface ProjectBlueprint {
  name: string
  description: string
  techStack: TechStack
  fileStructure: BlueprintFileStructure
  dependencies: Record<string, string>
  scripts: Record<string, string>
  initialTasks: Partial<Task>[]
  requiredAgents: string[] // AgentTypes
}

export interface BlueprintFileStructure {
  directories: string[]
  files: BlueprintFile[]
}

export interface BlueprintFile {
  path: string
  content: string
  template?: string
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  blueprint: ProjectBlueprint
  tags: string[]
  popularity: number
}

export const PROJECT_TEMPLATES: Record<string, ProjectTemplate> = {
  'react-app': {
    id: 'react-app',
    name: 'React Application',
    description: 'Modern React app with TypeScript and Vite',
    category: 'frontend',
    icon: '⚛️',
    blueprint: {
      name: 'React App',
      description: 'A modern React application',
      techStack: {
        frontend: ['react', 'typescript', 'vite', 'tailwindcss'],
      },
      fileStructure: {
        directories: ['src', 'public', 'src/components', 'src/hooks', 'src/utils'],
        files: [],
      },
      dependencies: {},
      scripts: {},
      initialTasks: [],
      requiredAgents: ['frontend'],
    },
    tags: ['react', 'typescript', 'frontend'],
    popularity: 100,
  },
  'fullstack-app': {
    id: 'fullstack-app',
    name: 'Full-Stack Application',
    description: 'Complete full-stack app with React, Node.js, and PostgreSQL',
    category: 'fullstack',
    icon: '🚀',
    blueprint: {
      name: 'Full-Stack App',
      description: 'A complete full-stack application',
      techStack: {
        frontend: ['react', 'typescript', 'vite'],
        backend: ['node', 'express', 'typescript'],
        database: ['postgresql'],
      },
      fileStructure: {
        directories: [
          'frontend/src',
          'frontend/public',
          'backend/src',
          'backend/src/routes',
          'backend/src/controllers',
          'backend/src/models',
        ],
        files: [],
      },
      dependencies: {},
      scripts: {},
      initialTasks: [],
      requiredAgents: ['frontend', 'backend', 'database'],
    },
    tags: ['fullstack', 'react', 'node', 'postgresql'],
    popularity: 90,
  },
}
