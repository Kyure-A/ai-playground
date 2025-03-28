# Assignment Discord Bot

A Discord bot that fetches assignments from Google Classroom, Microsoft Teams, and Moodle, and posts them daily to a specific Discord channel.

## Features

- Fetches assignments from Google Classroom
- Fetches assignments from Microsoft Teams
- Fetches assignments from Moodle
- Centralizes assignment management
- Posts daily updates to a Discord channel
- Deployable on Vercel

## Setup

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- A Discord bot token
- API credentials for Google Classroom, Microsoft Graph, and Moodle

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   cp .env.example .env
   ```
4. Build the project:
   ```
   npm run build
   ```
5. Start the bot:
   ```
   npm start
   ```

### Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" tab and click "Add Bot"
4. Copy the token and add it to your `.env` file as `DISCORD_TOKEN`
5. Enable the "Server Members Intent" and "Message Content Intent" under Privileged Gateway Intents
6. Use the OAuth2 URL Generator to create an invite link with the `bot` scope and the following permissions:
   - Read Messages/View Channels
   - Send Messages
   - Embed Links
7. Invite the bot to your server

### Authentication Setup

This bot uses direct login with credentials and 2FA for accessing school-provided accounts with restricted API access.

#### Google Classroom

1. Prepare your Google account credentials:
   - Email address
   - Password
   - 2FA secret key (for generating TOTP codes)
   - Recovery phone number (if required)
2. Add these credentials to your `.env` file

#### Microsoft Teams

1. Prepare your Microsoft account credentials:
   - Email address
   - Password
   - 2FA secret key (for generating TOTP codes)
2. Add these credentials to your `.env` file

#### Moodle

1. Prepare your Moodle account credentials:
   - Moodle site URL
   - Username
   - Password
2. Add these credentials to your `.env` file

### Two-Factor Authentication (2FA) Setup

For accounts that require 2FA, you'll need to set up TOTP (Time-based One-Time Password):

1. When setting up 2FA on your Google or Microsoft account, choose the "Authenticator app" option
2. When shown the QR code, look for an option to "Can't scan the QR code?" or similar
3. This will display a secret key (a string of letters and numbers)
4. Copy this secret key to your `.env` file as `GOOGLE_2FA_SECRET` or `MICROSOFT_2FA_SECRET`
5. The bot will use this secret to generate valid 2FA codes when logging in

## Deployment on Vercel

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```
2. Login to Vercel:
   ```
   vercel login
   ```
3. Deploy the project:
   ```
   vercel
   ```
4. Set up environment variables in the Vercel dashboard

## License

MIT
