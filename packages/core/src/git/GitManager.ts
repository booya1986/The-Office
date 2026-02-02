/**
 * GitManager - Handles Git operations
 */

import { EventEmitter } from 'events'
import simpleGit, { SimpleGit, StatusResult, DiffResult } from 'simple-git'

export interface GitConfig {
  remote?: string
  branch?: string
  author?: {
    name: string
    email: string
  }
}

export interface CommitInfo {
  hash: string
  message: string
  author: string
  date: Date
  files: string[]
}

export class GitManager extends EventEmitter {
  private git: SimpleGit
  private repoPath: string
  private config: GitConfig

  constructor(repoPath: string, config: GitConfig = {}) {
    super()
    this.repoPath = repoPath
    this.config = config
    this.git = simpleGit(repoPath)
  }

  /**
   * Initialize Git repository
   */
  async init(): Promise<void> {
    try {
      await this.git.init()

      // Set config if provided
      if (this.config.author) {
        await this.git.addConfig('user.name', this.config.author.name)
        await this.git.addConfig('user.email', this.config.author.email)
      }

      this.emit('repo_initialized', { path: this.repoPath })
    } catch (error) {
      throw new Error(
        `Failed to initialize repository: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Check if directory is a Git repository
   */
  async isRepository(): Promise<boolean> {
    try {
      await this.git.status()
      return true
    } catch {
      return false
    }
  }

  /**
   * Get repository status
   */
  async status(): Promise<StatusResult> {
    try {
      const status = await this.git.status()
      this.emit('status_checked', { status })
      return status
    } catch (error) {
      throw new Error(
        `Failed to get status: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Get diff for changes
   */
  async diff(file?: string): Promise<string> {
    try {
      const diff = file ? await this.git.diff([file]) : await this.git.diff()
      return diff
    } catch (error) {
      throw new Error(
        `Failed to get diff: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Stage files
   */
  async add(files: string | string[]): Promise<void> {
    try {
      const fileList = Array.isArray(files) ? files : [files]
      await this.git.add(fileList)

      this.emit('files_staged', { files: fileList })
    } catch (error) {
      throw new Error(
        `Failed to stage files: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Commit changes
   */
  async commit(message: string, files?: string[]): Promise<string> {
    try {
      // Stage files if provided
      if (files && files.length > 0) {
        await this.add(files)
      }

      const result = await this.git.commit(message)

      this.emit('committed', {
        hash: result.commit,
        message,
        files: result.summary.changes,
      })

      return result.commit
    } catch (error) {
      throw new Error(
        `Failed to commit: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Push changes to remote
   */
  async push(remote = 'origin', branch?: string): Promise<void> {
    try {
      const targetBranch = branch || this.config.branch || 'main'

      await this.git.push(remote, targetBranch)

      this.emit('pushed', { remote, branch: targetBranch })
    } catch (error) {
      throw new Error(
        `Failed to push: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Pull changes from remote
   */
  async pull(remote = 'origin', branch?: string): Promise<void> {
    try {
      const targetBranch = branch || this.config.branch || 'main'

      await this.git.pull(remote, targetBranch)

      this.emit('pulled', { remote, branch: targetBranch })
    } catch (error) {
      throw new Error(
        `Failed to pull: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string, checkout = true): Promise<void> {
    try {
      if (checkout) {
        await this.git.checkoutLocalBranch(branchName)
      } else {
        await this.git.branch([branchName])
      }

      this.emit('branch_created', { branch: branchName, checkout })
    } catch (error) {
      throw new Error(
        `Failed to create branch: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Switch to branch
   */
  async checkout(branchName: string): Promise<void> {
    try {
      await this.git.checkout(branchName)

      this.emit('branch_switched', { branch: branchName })
    } catch (error) {
      throw new Error(
        `Failed to checkout branch: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Get current branch
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const result = await this.git.branch()
      return result.current
    } catch (error) {
      throw new Error(
        `Failed to get current branch: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Get all branches
   */
  async getBranches(): Promise<{
    current: string
    all: string[]
    local: string[]
    remote: string[]
  }> {
    try {
      const result = await this.git.branch()

      return {
        current: result.current,
        all: result.all,
        local: result.all.filter((b) => !b.startsWith('remotes/')),
        remote: result.all.filter((b) => b.startsWith('remotes/')),
      }
    } catch (error) {
      throw new Error(
        `Failed to get branches: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Get commit history
   */
  async getHistory(maxCount = 10): Promise<CommitInfo[]> {
    try {
      const log = await this.git.log({ maxCount })

      return log.all.map((commit) => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: new Date(commit.date),
        files: commit.diff?.files?.map((f) => f.file) || [],
      }))
    } catch (error) {
      throw new Error(
        `Failed to get history: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Clone repository
   */
  async clone(repoUrl: string, targetPath: string): Promise<void> {
    try {
      await this.git.clone(repoUrl, targetPath)

      this.emit('repo_cloned', { url: repoUrl, path: targetPath })
    } catch (error) {
      throw new Error(
        `Failed to clone repository: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Add remote
   */
  async addRemote(name: string, url: string): Promise<void> {
    try {
      await this.git.addRemote(name, url)

      this.emit('remote_added', { name, url })
    } catch (error) {
      throw new Error(
        `Failed to add remote: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Get remotes
   */
  async getRemotes(): Promise<Array<{ name: string; refs: { fetch: string; push: string } }>> {
    try {
      return await this.git.getRemotes(true)
    } catch (error) {
      throw new Error(
        `Failed to get remotes: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Fetch from remote
   */
  async fetch(remote = 'origin'): Promise<void> {
    try {
      await this.git.fetch(remote)

      this.emit('fetched', { remote })
    } catch (error) {
      throw new Error(
        `Failed to fetch: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Merge branch
   */
  async merge(branchName: string): Promise<void> {
    try {
      await this.git.merge([branchName])

      this.emit('merged', { branch: branchName })
    } catch (error) {
      throw new Error(
        `Failed to merge: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Reset changes
   */
  async reset(mode: 'soft' | 'mixed' | 'hard' = 'mixed', commit = 'HEAD'): Promise<void> {
    try {
      await this.git.reset([`--${mode}`, commit])

      this.emit('reset', { mode, commit })
    } catch (error) {
      throw new Error(
        `Failed to reset: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Stash changes
   */
  async stash(message?: string): Promise<void> {
    try {
      if (message) {
        await this.git.stash(['save', message])
      } else {
        await this.git.stash()
      }

      this.emit('stashed', { message })
    } catch (error) {
      throw new Error(
        `Failed to stash: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Apply stash
   */
  async stashPop(): Promise<void> {
    try {
      await this.git.stash(['pop'])

      this.emit('stash_applied')
    } catch (error) {
      throw new Error(
        `Failed to apply stash: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Get changed files
   */
  async getChangedFiles(): Promise<{
    modified: string[]
    added: string[]
    deleted: string[]
    renamed: string[]
    untracked: string[]
  }> {
    try {
      const status = await this.status()

      return {
        modified: status.modified,
        added: status.created,
        deleted: status.deleted,
        renamed: status.renamed.map((r) => r.to),
        untracked: status.not_added,
      }
    } catch (error) {
      throw new Error(
        `Failed to get changed files: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Check if repository has uncommitted changes
   */
  async hasChanges(): Promise<boolean> {
    try {
      const status = await this.status()
      return !status.isClean()
    } catch (error) {
      throw new Error(
        `Failed to check for changes: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  /**
   * Cleanup
   */
  shutdown(): void {
    this.removeAllListeners()
  }
}
