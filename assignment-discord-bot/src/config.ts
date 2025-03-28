import dotenv from 'dotenv';
import { ClientOptions, GatewayIntentBits } from 'discord.js';

// Load environment variables
dotenv.config();

// Discord configuration
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '';
export const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '';

// Google Classroom configuration
export const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL || '';
export const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD || '';
export const GOOGLE_2FA_SECRET = process.env.GOOGLE_2FA_SECRET || '';
export const GOOGLE_RECOVERY_PHONE = process.env.GOOGLE_RECOVERY_PHONE || '';

// Microsoft Teams configuration
export const MICROSOFT_EMAIL = process.env.MICROSOFT_EMAIL || '';
export const MICROSOFT_PASSWORD = process.env.MICROSOFT_PASSWORD || '';
export const MICROSOFT_2FA_SECRET = process.env.MICROSOFT_2FA_SECRET || '';

// Moodle configuration
export const MOODLE_URL = process.env.MOODLE_URL || '';
export const MOODLE_USERNAME = process.env.MOODLE_USERNAME || '';
export const MOODLE_PASSWORD = process.env.MOODLE_PASSWORD || '';

// Schedule configuration
export const SCHEDULE_TIME = process.env.SCHEDULE_TIME || '0 9 * * *'; // Default: Every day at 9 AM

// Discord client options
export const discordClientOptions: ClientOptions = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
};

// Validate required environment variables
export function validateConfig(): boolean {
  const requiredVars = [
    'DISCORD_TOKEN',
    'DISCORD_CHANNEL_ID',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}
