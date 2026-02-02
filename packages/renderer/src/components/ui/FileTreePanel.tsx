/**
 * FileTreePanel - Project file tree
 */

import React from 'react'

export const FileTreePanel: React.FC = () => {
  return (
    <div className="file-tree-panel">
      <div className="file-tree-header">
        <h3>📁 Files</h3>
      </div>

      <div className="file-tree">
        <div className="file-tree-item folder">
          <span>📁 src</span>
        </div>
        <div className="file-tree-item file">
          <span>📄 index.ts</span>
        </div>
        <div className="file-tree-item file">
          <span>📄 app.tsx</span>
        </div>
      </div>
    </div>
  )
}
