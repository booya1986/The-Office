/**
 * Configuration for the cloud service
 */

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  isDev: process.env.NODE_ENV !== 'production',
}

export function validateConfig(): void {
  if (!config.anthropicApiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable is required')
    console.error('Please create a .env file with your API key:')
    console.error('  echo "ANTHROPIC_API_KEY=sk-ant-your-key" > .env')
    process.exit(1)
  }
}
