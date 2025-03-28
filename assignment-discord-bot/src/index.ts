import { validateConfig } from './config';
import { DiscordBot } from './discordBot';

// For Vercel serverless functions
export const config = {
  api: {
    bodyParser: false,
  },
};

// Global bot instance
let bot: DiscordBot | null = null;

/**
 * Main function to start the bot
 */
async function main() {
  try {
    // Validate environment variables
    if (!validateConfig()) {
      console.error('Invalid configuration. Please check your environment variables.');
      process.exit(1);
    }

    // Create and start the bot
    bot = new DiscordBot();
    await bot.start();

    // Handle process termination
    process.on('SIGINT', async () => {
      console.log('Received SIGINT. Shutting down...');
      if (bot) {
        await bot.stop();
      }
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM. Shutting down...');
      if (bot) {
        await bot.stop();
      }
      process.exit(0);
    });

    console.log('Bot is running. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('Failed to start the bot:', error);
    process.exit(1);
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  main();
}

// Vercel serverless function for cron job
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate environment variables
    if (!validateConfig()) {
      return res.status(500).json({ error: 'Invalid configuration' });
    }

    // Create bot instance if it doesn't exist
    if (!bot) {
      bot = new DiscordBot();
      await bot.start();
    }

    // Trigger assignment update
    await bot.triggerUpdate();

    return res.status(200).json({ success: true, message: 'Assignment update triggered' });
  } catch (error) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// API route for Vercel cron job
export async function cron(req: any, res: any) {
  try {
    // Validate environment variables
    if (!validateConfig()) {
      return res.status(500).json({ error: 'Invalid configuration' });
    }

    // Create bot instance if it doesn't exist
    if (!bot) {
      bot = new DiscordBot();
      await bot.start();
    }

    // Trigger assignment update
    await bot.triggerUpdate();

    return res.status(200).json({ success: true, message: 'Cron job executed successfully' });
  } catch (error) {
    console.error('Error in cron job:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
