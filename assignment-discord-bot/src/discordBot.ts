import { Client, TextChannel } from 'discord.js';
import cron from 'node-cron';
import { discordClientOptions, DISCORD_TOKEN, DISCORD_CHANNEL_ID, SCHEDULE_TIME } from './config';
import { AssignmentManager } from './services/assignmentManager';
import { DiscordFormatter } from './services/discordFormatter';

export class DiscordBot {
  private client: Client;
  private assignmentManager: AssignmentManager;
  private formatter: DiscordFormatter;
  private scheduledTask: cron.ScheduledTask | null = null;

  constructor() {
    this.client = new Client(discordClientOptions);
    this.assignmentManager = new AssignmentManager();
    this.formatter = new DiscordFormatter();

    // Set up event handlers
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle ready event
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}`);
      this.scheduleAssignmentUpdates();
    });

    // Handle errors
    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
  }

  /**
   * Starts the Discord bot
   */
  public async start(): Promise<void> {
    try {
      await this.client.login(DISCORD_TOKEN);
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
      throw error;
    }
  }

  /**
   * Stops the Discord bot
   */
  public async stop(): Promise<void> {
    // Stop the scheduled task
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
    }

    // Destroy the client
    this.client.destroy();
  }

  /**
   * Schedules the daily assignment updates
   */
  private scheduleAssignmentUpdates(): void {
    console.log(`Scheduling assignment updates at: ${SCHEDULE_TIME}`);
    
    this.scheduledTask = cron.schedule(SCHEDULE_TIME, async () => {
      console.log('Running scheduled assignment update...');
      await this.sendAssignmentUpdate();
    });
  }

  /**
   * Sends an assignment update to the configured Discord channel
   */
  public async sendAssignmentUpdate(): Promise<void> {
    try {
      // Get the channel
      const channel = await this.client.channels.fetch(DISCORD_CHANNEL_ID);
      
      if (!channel || !(channel instanceof TextChannel)) {
        throw new Error(`Invalid channel ID: ${DISCORD_CHANNEL_ID}`);
      }

      console.log(`Sending assignment update to channel: ${channel.name}`);

      // Get upcoming assignments
      const assignments = await this.assignmentManager.getUpcomingAssignments(7);
      const message = this.formatter.formatAssignmentsMessage(assignments);
      
      // Send the message
      await channel.send(message);

      // Check for overdue assignments
      const overdueAssignments = await this.assignmentManager.getOverdueAssignments();
      
      if (overdueAssignments.length > 0) {
        const overdueMessage = this.formatter.formatOverdueMessage(overdueAssignments);
        await channel.send(overdueMessage);
      }

      console.log('Assignment update sent successfully');
    } catch (error) {
      console.error('Error sending assignment update:', error);
    }
  }

  /**
   * Manually triggers an assignment update
   */
  public async triggerUpdate(): Promise<void> {
    console.log('Manually triggering assignment update...');
    await this.sendAssignmentUpdate();
  }
}
