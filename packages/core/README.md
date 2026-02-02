# @pixel-office/core

> Core business logic for Pixel Office Simulator

This package provides the foundational services for managing projects, tasks, files, and Git operations in Pixel Office Simulator.

## Features

- ✅ **ProjectManager** - Project lifecycle management
- ✅ **TaskManager** - Task orchestration with Kanban boards
- ✅ **FileSystemManager** - File operations with history
- ✅ **GitManager** - Complete Git integration

## Installation

```bash
pnpm add @pixel-office/core
```

## Quick Start

### ProjectManager

```typescript
import { ProjectManager } from '@pixel-office/core'

const projectManager = new ProjectManager({
  workspaceRoot: '/path/to/workspace',
  autoSave: true,
  watchFiles: true
})

// Create new project
const project = await projectManager.createProject({
  name: 'my-app',
  description: 'My awesome app',
  techStack: {
    frontend: ['react', 'typescript'],
    backend: ['node', 'express']
  },
  fileStructure: {
    directories: ['src', 'tests'],
    files: []
  },
  dependencies: {},
  scripts: {},
  initialTasks: [],
  requiredAgents: ['frontend', 'backend']
})

// Open existing project
const existingProject = await projectManager.openProject('/path/to/project')

// Get current project
const current = projectManager.getCurrentProject()
```

### TaskManager

```typescript
import { TaskManager } from '@pixel-office/core'
import { TaskPriority, TaskStatus, TaskType } from '@pixel-office/shared'

const taskManager = new TaskManager({
  maxConcurrentTasks: 5,
  autoAssignTasks: false
})

// Create task
const task = taskManager.createTask({
  title: 'Create login component',
  description: 'Build React login component with validation',
  type: TaskType.UI_COMPONENT,
  priority: TaskPriority.HIGH,
  status: TaskStatus.BACKLOG,
  assignedTo: null,
  dependencies: [],
  blockedBy: [],
  estimatedEffort: 60,
  actualEffort: 0,
  progress: 0,
  startedAt: null,
  completedAt: null,
  dueDate: null,
  result: null,
  metadata: {}
})

// Assign task
taskManager.assignTask(task.id, AgentType.FRONTEND)

// Start task
taskManager.startTask(task.id)

// Update progress
taskManager.updateProgress(task.id, 50, 'Component structure complete')

// Complete task
taskManager.completeTask(task.id, {
  success: true,
  output: 'Login component created successfully',
  filesChanged: ['src/components/Login.tsx'],
  testsRun: 5,
  testsPassed: 5,
  errors: [],
  warnings: [],
  metrics: {}
})

// Get Kanban board
const kanban = taskManager.getKanban()

// Get statistics
const stats = taskManager.getStatistics()
```

### FileSystemManager

```typescript
import { FileSystemManager } from '@pixel-office/core'

const fsManager = new FileSystemManager()

// Read file
const content = await fsManager.readFile('src/index.ts')

// Write file
await fsManager.writeFile('src/new-file.ts', 'export const foo = "bar"')

// Edit file
await fsManager.editFile(
  'src/index.ts',
  'old content',
  'new content'
)

// Delete file
await fsManager.deleteFile('src/old-file.ts')

// List directory
const files = await fsManager.listDirectory('src', true) // recursive

// Check if exists
const exists = await fsManager.fileExists('package.json')

// Get file stats
const stats = await fsManager.getFileStats('src/index.ts')

// Copy file
await fsManager.copyFile('src/index.ts', 'src/index.backup.ts')

// Move file
await fsManager.moveFile('old/path.ts', 'new/path.ts')

// Get operation history
const history = fsManager.getHistory()
```

### GitManager

```typescript
import { GitManager } from '@pixel-office/core'

const gitManager = new GitManager('/path/to/repo', {
  remote: 'origin',
  branch: 'main',
  author: {
    name: 'Your Name',
    email: 'your@email.com'
  }
})

// Initialize repository
await gitManager.init()

// Check if is repository
const isRepo = await gitManager.isRepository()

// Get status
const status = await gitManager.status()
console.log('Modified files:', status.modified)

// Get diff
const diff = await gitManager.diff('src/index.ts')

// Stage files
await gitManager.add(['src/index.ts', 'src/utils.ts'])
// Or stage all
await gitManager.add('.')

// Commit
const commitHash = await gitManager.commit('feat: add new feature')

// Push
await gitManager.push('origin', 'main')

// Pull
await gitManager.pull('origin', 'main')

// Create branch
await gitManager.createBranch('feature/new-feature', true) // checkout immediately

// Switch branch
await gitManager.checkout('develop')

// Get current branch
const currentBranch = await gitManager.getCurrentBranch()

// Get commit history
const history = await gitManager.getHistory(10) // last 10 commits

// Get changed files
const changes = await gitManager.getChangedFiles()
console.log('Modified:', changes.modified)
console.log('Added:', changes.added)
console.log('Deleted:', changes.deleted)

// Check for uncommitted changes
const hasChanges = await gitManager.hasChanges()

// Stash changes
await gitManager.stash('WIP: feature in progress')

// Apply stash
await gitManager.stashPop()
```

## Events

All managers emit events for monitoring:

### ProjectManager Events

```typescript
projectManager.on('project_created', ({ projectId, project }) => {
  console.log('Project created:', projectId)
})

projectManager.on('project_opened', ({ projectId, project }) => {
  console.log('Project opened:', projectId)
})

projectManager.on('file_added', ({ projectId, filePath }) => {
  console.log('File added:', filePath)
})

projectManager.on('file_changed', ({ projectId, filePath }) => {
  console.log('File changed:', filePath)
})
```

### TaskManager Events

```typescript
taskManager.on('task_created', ({ taskId, task }) => {
  console.log('Task created:', taskId)
})

taskManager.on('task_assigned', ({ taskId, agentType }) => {
  console.log('Task assigned to:', agentType)
})

taskManager.on('task_progress', ({ taskId, progress, message }) => {
  console.log(`Task ${taskId}: ${progress}% - ${message}`)
})

taskManager.on('task_completed', ({ taskId, result }) => {
  console.log('Task completed:', taskId)
})
```

### FileSystemManager Events

```typescript
fsManager.on('file_read', ({ path }) => {
  console.log('File read:', path)
})

fsManager.on('file_written', ({ path, size }) => {
  console.log('File written:', path, `(${size} bytes)`)
})

fsManager.on('file_edited', ({ path }) => {
  console.log('File edited:', path)
})
```

### GitManager Events

```typescript
gitManager.on('committed', ({ hash, message, files }) => {
  console.log('Committed:', hash, message)
})

gitManager.on('pushed', ({ remote, branch }) => {
  console.log('Pushed to:', remote, branch)
})

gitManager.on('branch_created', ({ branch, checkout }) => {
  console.log('Branch created:', branch)
})
```

## Integration Example

Complete example using all managers together:

```typescript
import {
  ProjectManager,
  TaskManager,
  FileSystemManager,
  GitManager
} from '@pixel-office/core'

// Initialize managers
const projectManager = new ProjectManager({
  workspaceRoot: './workspace'
})

const taskManager = new TaskManager({
  maxConcurrentTasks: 5
})

const fsManager = new FileSystemManager()
const gitManager = new GitManager('./workspace/my-project')

// Create project
const project = await projectManager.createProject({
  name: 'my-project',
  description: 'My awesome project',
  techStack: { frontend: ['react'] },
  // ...other config
})

// Initialize Git
await gitManager.init()

// Create task
const task = taskManager.createTask({
  title: 'Setup React app',
  type: TaskType.PROJECT_INIT,
  // ...other config
})

// Execute task (via agent)
taskManager.startTask(task.id)

// Create files
await fsManager.writeFile(
  `${project.rootPath}/src/App.tsx`,
  'export const App = () => <div>Hello</div>'
)

// Commit
await gitManager.add('.')
await gitManager.commit('feat: initial setup')

// Complete task
taskManager.completeTask(task.id, {
  success: true,
  output: 'React app set up successfully',
  filesChanged: ['src/App.tsx'],
  // ...
})

// Cleanup
await projectManager.shutdown()
taskManager.shutdown()
fsManager.shutdown()
gitManager.shutdown()
```

## License

MIT
