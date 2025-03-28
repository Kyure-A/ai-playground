/**
 * Health check API endpoint
 * This can be used to verify that the bot is deployed and running
 */
export default function handler(req: any, res: any) {
  const startTime = process.env.START_TIME || new Date().toISOString();
  
  return res.status(200).json({
    status: 'ok',
    service: 'assignment-discord-bot',
    version: process.env.npm_package_version || '1.0.0',
    uptime: new Date().getTime() - new Date(startTime).getTime(),
    timestamp: new Date().toISOString()
  });
}
