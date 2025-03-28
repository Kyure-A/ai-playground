import { validateConfig } from '../src/config';
import { DiscordBot } from '../src/discordBot';

// Global bot instance
let bot: DiscordBot | null = null;

/**
 * API endpoint to manually trigger an assignment update
 * This can be used to force an update outside of the scheduled time
 */
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Manual trigger requested at:', new Date().toISOString());
    
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
    console.log('Manually triggering assignment update');
    await bot.triggerUpdate();

    return res.status(200).json({ 
      success: true, 
      message: 'Manual assignment update triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in manual trigger:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
