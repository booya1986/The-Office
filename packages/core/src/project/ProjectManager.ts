/**
 * ProjectManager - Manages project lifecycle and state
 */

import { EventEmitter } from 'events'
import * as path from 'path'
import * as fs from 'fs/promises'
import { Project, ProjectBlueprint, FileNode, ProjectSettings } from '@pixel-office/shared'
import { watch, FSWatcher } from 'chokidar'

export interface ProjectManagerConfig {
  workspaceRoot: string
  autoSave?: boolean
  watchFiles?: boolean
}

export class ProjectManager extends EventEmitter {
  private projects: Map<string, Project>
  private currentProject: Project | null
  private config: Required<ProjectManagerConfig>
  private watchers: Map<string, FSWatcher>

  constructor(config: ProjectManagerConfig) {
    super()
    this.projects = new Map()
    this.currentProject = null
    this.watchers = new Map()
    this.config = {
      workspaceRoot: config.workspaceRoot,
      autoSave: config.autoSave ?? true,
      watchFiles: config.watchFiles ?? true,
    }
  }

  /**
   * Create a new project from blueprint
   */
  async createProject(blueprint: ProjectBlueprint): Promise<Project> {
    const projectId = this.generateProjectId()
    const projectPath = path.join(this.config.workspaceRoot, blueprint.name)

    // Check if directory already exists
    try {
      await fs.access(projectPath)
      throw new Error(`Project directory already exists: ${projectPath}`)
    } catch {
      // Directory doesn't exist, good to proceed
    }

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true })

    // Create project structure
    await this.createProjectStructure(projectPath, blueprint)

    // Create project object
    const project: Project = {
      id: projectId,
      name: blueprint.name,
      description: blueprint.description,
      rootPath: projectPath,
      techStack: blueprint.techStack,
      framework: this.inferFramework(blueprint.techStack),
      language: this.inferLanguages(blueprint.techStack),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastOpenedAt: new Date(),
      metadata: {
        author: 'Pixel Office User',
        version: '0.1.0',
        license: 'MIT',
        tags: [],
        customData: {},
      },
      gitConfig: null,
      fileTree: await this.buildFileTree(projectPath),
      agents: [],
      tasks: [],
      kanban: null,
      backlog: null,
      pipeline: null,
      settings: this.getDefaultSettings(),
    }

    // Save project
    this.projects.set(projectId, project)
    this.currentProject = project

    // Save project metadata
    await this.saveProjectMetadata(project)

    // Start watching if enabled
    if (this.config.watchFiles) {
      this.watchProject(project)
    }

    this.emit('project_created', { projectId, project })

    return project
  }

  /**
   * Open an existing project
   */
  async openProject(projectPath: string): Promise<Project> {
    // Load project metadata
    const metadataPath = path.join(projectPath, '.pixeloffice', 'project.json')

    let project: Project

    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8')
      project = JSON.parse(metadataContent)

      // Update paths and timestamps
      project.rootPath = projectPath
      project.lastOpenedAt = new Date()
      project.fileTree = await this.buildFileTree(projectPath)
    } catch {
      // No metadata found, create new project from directory
      project = await this.createProjectFromDirectory(projectPath)
    }

    this.projects.set(project.id, project)
    this.currentProject = project

    // Start watching
    if (this.config.watchFiles) {
      this.watchProject(project)
    }

    this.emit('project_opened', { projectId: project.id, project })

    return project
  }

  /**
   * Close current project
   */
  async closeProject(projectId?: string): Promise<void> {
    const id = projectId || this.currentProject?.id

    if (!id) {
      return
    }

    const project = this.projects.get(id)
    if (!project) {
      return
    }

    // Save project state
    if (this.config.autoSave) {
      await this.saveProjectMetadata(project)
    }

    // Stop watching
    const watcher = this.watchers.get(id)
    if (watcher) {
      await watcher.close()
      this.watchers.delete(id)
    }

    if (this.currentProject?.id === id) {
      this.currentProject = null
    }

    this.emit('project_closed', { projectId: id })
  }

  /**
   * Get current project
   */
  getCurrentProject(): Project | null {
    return this.currentProject
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return Array.from(this.projects.values())
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const project = this.projects.get(projectId)
    if (!project) {
      throw new Error(`Project not found: ${projectId}`)
    }

    Object.assign(project, updates, { updatedAt: new Date() })

    if (this.config.autoSave) {
      await this.saveProjectMetadata(project)
    }

    this.emit('project_updated', { projectId, updates })
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, deleteFiles = false): Promise<void> {
    const project = this.projects.get(projectId)
    if (!project) {
      throw new Error(`Project not found: ${projectId}`)
    }

    // Close first
    await this.closeProject(projectId)

    // Delete files if requested
    if (deleteFiles) {
      await fs.rm(project.rootPath, { recursive: true, force: true })
    }

    this.projects.delete(projectId)

    this.emit('project_deleted', { projectId, deleteFiles })
  }

  /**
   * Build file tree for project
   */
  async buildFileTree(rootPath: string, relativePath = ''): Promise<FileNode[]> {
    const fullPath = path.join(rootPath, relativePath)
    const entries = await fs.readdir(fullPath, { withFileTypes: true })

    const nodes: FileNode[] = []

    for (const entry of entries) {
      const entryPath = path.join(relativePath, entry.name)
      const fullEntryPath = path.join(rootPath, entryPath)

      // Skip ignored directories
      if (this.shouldIgnore(entry.name)) {
        continue
      }

      const stats = await fs.stat(fullEntryPath)

      const node: FileNode = {
        path: entryPath,
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        extension: entry.isFile() ? path.extname(entry.name) : undefined,
        lastModified: stats.mtime,
        isGitIgnored: false, // Will be updated by GitManager
      }

      // Recursively build children for directories
      if (entry.isDirectory()) {
        node.children = await this.buildFileTree(rootPath, entryPath)
      }

      nodes.push(node)
    }

    return nodes.sort((a, b) => {
      // Directories first, then alphabetically
      if (a.type === 'directory' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'directory') return 1
      return a.name.localeCompare(b.name)
    })
  }

  /**
   * Watch project for file changes
   */
  private watchProject(project: Project): void {
    const watcher = watch(project.rootPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    })

    watcher
      .on('add', (filePath) => {
        this.emit('file_added', { projectId: project.id, filePath })
        this.refreshFileTree(project)
      })
      .on('change', (filePath) => {
        this.emit('file_changed', { projectId: project.id, filePath })
      })
      .on('unlink', (filePath) => {
        this.emit('file_deleted', { projectId: project.id, filePath })
        this.refreshFileTree(project)
      })

    this.watchers.set(project.id, watcher)
  }

  /**
   * Refresh file tree for project
   */
  private async refreshFileTree(project: Project): Promise<void> {
    project.fileTree = await this.buildFileTree(project.rootPath)
    project.updatedAt = new Date()
    this.emit('file_tree_updated', { projectId: project.id })
  }

  /**
   * Create project structure from blueprint
   */
  private async createProjectStructure(
    projectPath: string,
    blueprint: ProjectBlueprint
  ): Promise<void> {
    // Create directories
    for (const dir of blueprint.fileStructure.directories) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true })
    }

    // Create files
    for (const file of blueprint.fileStructure.files) {
      await fs.writeFile(
        path.join(projectPath, file.path),
        file.content,
        'utf-8'
      )
    }

    // Create .pixeloffice directory for metadata
    await fs.mkdir(path.join(projectPath, '.pixeloffice'), { recursive: true })

    // Create package.json if dependencies defined
    if (Object.keys(blueprint.dependencies).length > 0) {
      const packageJson = {
        name: blueprint.name,
        version: '0.1.0',
        description: blueprint.description,
        scripts: blueprint.scripts,
        dependencies: blueprint.dependencies,
      }
      await fs.writeFile(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf-8'
      )
    }
  }

  /**
   * Save project metadata
   */
  private async saveProjectMetadata(project: Project): Promise<void> {
    const metadataPath = path.join(project.rootPath, '.pixeloffice', 'project.json')
    await fs.writeFile(metadataPath, JSON.stringify(project, null, 2), 'utf-8')
  }

  /**
   * Create project from existing directory
   */
  private async createProjectFromDirectory(projectPath: string): Promise<Project> {
    const name = path.basename(projectPath)
    const projectId = this.generateProjectId()

    return {
      id: projectId,
      name,
      description: `Imported project: ${name}`,
      rootPath: projectPath,
      techStack: {},
      framework: null,
      language: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastOpenedAt: new Date(),
      metadata: {
        author: 'Pixel Office User',
        version: '0.1.0',
        license: 'MIT',
        tags: ['imported'],
        customData: {},
      },
      gitConfig: null,
      fileTree: await this.buildFileTree(projectPath),
      agents: [],
      tasks: [],
      kanban: null,
      backlog: null,
      pipeline: null,
      settings: this.getDefaultSettings(),
    }
  }

  /**
   * Generate unique project ID
   */
  private generateProjectId(): string {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get default project settings
   */
  private getDefaultSettings(): ProjectSettings {
    return {
      autoSave: true,
      autoFormat: true,
      lintOnSave: true,
      testOnSave: false,
      officeTheme: 'modern-office',
      soundEnabled: true,
      musicVolume: 0.5,
      notificationsEnabled: true,
      agentAutonomy: {},
    }
  }

  /**
   * Infer primary framework from tech stack
   */
  private inferFramework(techStack: any): string | null {
    const frontend = techStack.frontend || []
    const backend = techStack.backend || []

    if (frontend.includes('react')) return 'react'
    if (frontend.includes('vue')) return 'vue'
    if (frontend.includes('angular')) return 'angular'
    if (backend.includes('express')) return 'express'
    if (backend.includes('fastify')) return 'fastify'

    return null
  }

  /**
   * Infer programming languages from tech stack
   */
  private inferLanguages(techStack: any): string[] {
    const languages = new Set<string>()

    const allTech = [
      ...(techStack.frontend || []),
      ...(techStack.backend || []),
      ...(techStack.tools || []),
    ]

    if (allTech.some((t: string) => t.includes('typescript'))) {
      languages.add('typescript')
    }
    if (allTech.some((t: string) => t.includes('javascript'))) {
      languages.add('javascript')
    }
    if (allTech.some((t: string) => t.includes('python'))) {
      languages.add('python')
    }
    if (allTech.some((t: string) => t.includes('go'))) {
      languages.add('go')
    }

    return Array.from(languages)
  }

  /**
   * Check if path should be ignored
   */
  private shouldIgnore(name: string): boolean {
    const ignoredDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'out',
      'coverage',
      '.cache',
    ]
    return ignoredDirs.includes(name)
  }

  /**
   * Cleanup
   */
  async shutdown(): Promise<void> {
    // Close all projects
    for (const projectId of this.projects.keys()) {
      await this.closeProject(projectId)
    }

    this.removeAllListeners()
  }
}
