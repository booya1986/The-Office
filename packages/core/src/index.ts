/**
 * @pixel-office/core
 * Core business logic for Pixel Office Simulator
 */

// Project Management
export { ProjectManager } from './project/ProjectManager'
export type { ProjectManagerConfig } from './project/ProjectManager'

// Task Management
export { TaskManager } from './task/TaskManager'
export type { TaskManagerConfig } from './task/TaskManager'

// File System
export { FileSystemManager } from './file/FileSystemManager'
export type { FileOperation } from './file/FileSystemManager'

// Git
export { GitManager } from './git/GitManager'
export type { GitConfig, CommitInfo } from './git/GitManager'
