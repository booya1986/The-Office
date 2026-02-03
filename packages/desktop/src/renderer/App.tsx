import React, { useEffect, useState } from 'react'
import { PixelOffice } from '@pixel-office/renderer'
import '@pixel-office/renderer/dist/styles/pixel-office.css'

export const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false)
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    // Get app version
    if (window.electronAPI) {
      window.electronAPI.getVersion().then((v) => {
        setVersion(v)
        console.log(`Pixel Office Simulator v${v}`)
      })

      // Listen to menu commands
      window.electronAPI.onMenuCommand((command, data) => {
        console.log('Menu command:', command, data)
        handleMenuCommand(command, data)
      })
    }
  }, [])

  const handleMenuCommand = (command: string, data?: any) => {
    switch (command) {
      case 'new-project':
        console.log('Create new project')
        break
      case 'open-project':
        console.log('Open project')
        break
      case 'toggle-panel':
        console.log('Toggle panel:', data)
        break
      case 'list-agents':
        console.log('List agents')
        break
      case 'chat-manager':
        console.log('Chat with manager')
        break
      case 'about':
        console.log('About Pixel Office')
        break
    }
  }

  const handleOfficeReady = () => {
    setIsReady(true)
    console.log('Pixel Office is ready!')
  }

  return (
    <div className="app">
      <PixelOffice
        projectPath={process.cwd()}
        onReady={handleOfficeReady}
      />
    </div>
  )
}
