import { validateConfig } from '../src/config';
import { DiscordBot } from '../src/discordBot';

// Global bot instance
let bot: DiscordBot | null = null;

/**
 * API route for Vercel cron job
 * This endpoint will be called by Vercel's cron job scheduler
 */
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Cron job triggered at:', new Date().toISOString());
    
    // Validate environment variables
    if (!validateConfig()) {
      return res.status(500).json({ error: 'Invalid configuration' });
    }

    // Create bot instance if it doesn't exist
    if (!bot) {
      console.log('Creating new Discord bot instance');
      bot = new DiscordBot();
      await bot.start();
    }

    // Trigger assignment update
    console.log('Triggering assignment update');
    await bot.triggerUpdate();

    return res.status(200).json({ 
      success: true, 
      message: 'Assignment update triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
