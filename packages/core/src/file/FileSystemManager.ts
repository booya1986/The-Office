/**
 * FileSystemManager - Handles file operations
 */

import { EventEmitter } from 'events'
import * as fs from 'fs/promises'
import * as path from 'path'
import { FS_CONFIG } from '@pixel-office/shared'

export interface FileOperation {
  type: 'read' | 'write' | 'edit' | 'delete' | 'create'
  path: string
  content?: string
  timestamp: Date
  success: boolean
  error?: string
}

export class FileSystemManager extends EventEmitter {
  private operationHistory: FileOperation[]
  private maxHistorySize: number

  constructor() {
    super()
    this.operationHistory = []
    this.maxHistorySize = 1000
  }

  /**
   * Read file contents
   */
  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')

      this.recordOperation({
        type: 'read',
        path: filePath,
        timestamp: new Date(),
        success: true,
      })

      this.emit('file_read', { path: filePath })

      return content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.recordOperation({
        type: 'read',
        path: filePath,
        timestamp: new Date(),
        success: false,
        error: errorMessage,
      })

      throw new Error(`Failed to read file ${filePath}: ${errorMessage}`)
    }
  }

  /**
   * Write file contents (create or overwrite)
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true })

      // Check file size
      if (content.length > FS_CONFIG.MAX_FILE_SIZE) {
        throw new Error(
          `File size exceeds maximum (${FS_CONFIG.MAX_FILE_SIZE} bytes)`
        )
      }

      await fs.writeFile(filePath, content, 'utf-8')

      this.recordOperation({
        type: 'write',
        path: filePath,
        content,
        timestamp: new Date(),
        success: true,
      })

      this.emit('file_written', { path: filePath, size: content.length })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.recordOperation({
        type: 'write',
        path: filePath,
        timestamp: new Date(),
        success: false,
        error: errorMessage,
      })

      throw new Error(`Failed to write file ${filePath}: ${errorMessage}`)
    }
  }

  /**
   * Edit file by replacing content
   */
  async editFile(
    filePath: string,
    oldContent: string,
    newContent: string
  ): Promise<void> {
    try {
      const currentContent = await this.readFile(filePath)

      if (!currentContent.includes(oldContent)) {
        throw new Error('Old content not found in file')
      }

      const updatedContent = currentContent.replace(oldContent, newContent)

      await this.writeFile(filePath, updatedContent)

      this.recordOperation({
        type: 'edit',
        path: filePath,
        content: newContent,
        timestamp: new Date(),
        success: true,
      })

      this.emit('file_edited', { path: filePath })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.recordOperation({
        type: 'edit',
        path: filePath,
        timestamp: new Date(),
        success: false,
        error: errorMessage,
      })

      throw new Error(`Failed to edit file ${filePath}: ${errorMessage}`)
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)

      this.recordOperation({
        type: 'delete',
        path: filePath,
        timestamp: new Date(),
        success: true,
      })

      this.emit('file_deleted', { path: filePath })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.recordOperation({
        type: 'delete',
        path: filePath,
        timestamp: new Date(),
        success: false,
        error: errorMessage,
      })

      throw new Error(`Failed to delete file ${filePath}: ${errorMessage}`)
    }
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true })

      this.emit('directory_created', { path: dirPath })
    } catch (error) {
      throw new Error(
        `Failed to create directory ${dirPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(
    dirPath: string,
    recursive = false
  ): Promise<
    Array<{
      name: string
      path: string
      type: 'file' | 'directory'
      size: number
    }>
  > {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      const results: Array<{
        name: string
        path: string
        type: 'file' | 'directory'
        size: number
      }> = []

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name)
        const stats = await fs.stat(entryPath)

        results.push({
          name: entry.name,
          path: entryPath,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
        })

        // Recurse if directory and recursive flag set
        if (recursive && entry.isDirectory()) {
          const subResults = await this.listDirectory(entryPath, true)
          results.push(...subResults)
        }
      }

      return results
    } catch (error) {
      throw new Error(
        `Failed to list directory ${dirPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<{
    size: number
    created: Date
    modified: Date
    isFile: boolean
    isDirectory: boolean
  }> {
    try {
      const stats = await fs.stat(filePath)

      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      }
    } catch (error) {
      throw new Error(
        `Failed to get stats for ${filePath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      await fs.mkdir(path.dirname(destPath), { recursive: true })
      await fs.copyFile(sourcePath, destPath)

      this.emit('file_copied', { source: sourcePath, dest: destPath })
    } catch (error) {
      throw new Error(
        `Failed to copy file from ${sourcePath} to ${destPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Move file
   */
  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      await fs.mkdir(path.dirname(destPath), { recursive: true })
      await fs.rename(sourcePath, destPath)

      this.emit('file_moved', { source: sourcePath, dest: destPath })
    } catch (error) {
      throw new Error(
        `Failed to move file from ${sourcePath} to ${destPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Get operation history
   */
  getHistory(): FileOperation[] {
    return [...this.operationHistory]
  }

  /**
   * Clear operation history
   */
  clearHistory(): void {
    this.operationHistory = []
  }

  /**
   * Record file operation
   */
  private recordOperation(operation: FileOperation): void {
    this.operationHistory.push(operation)

    // Keep history size under limit
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory = this.operationHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * Cleanup
   */
  shutdown(): void {
    this.removeAllListeners()
  }
}
