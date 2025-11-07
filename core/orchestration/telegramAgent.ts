import { Telegraf } from 'telegraf';
import { AetherDatabaseService } from './aetherSchema';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

/**
 * Telegram Agent for the Aether Content & Revenue Network
 * 
 * This service handles Telegram community building and content syndication
 * as part of the Aether automated content network.
 */

export class TelegramAgent {
  private static instance: TelegramAgent;
  private bot: Telegraf | null = null;
  private dbService: AetherDatabaseService;
  private agentId: number = 0;

  private constructor() {
    this.dbService = AetherDatabaseService.getInstance();
  }

  public static getInstance(): TelegramAgent {
    if (!TelegramAgent.instance) {
      TelegramAgent.instance = new TelegramAgent();
    }
    return TelegramAgent.instance;
  }

  /**
   * Initialize the Telegram agent and register it in the database
   */
  async initialize(): Promise<void> {
    try {
      // Register agent in database
      const agent = await this.dbService.createAgent({
        name: 'telegram-community',
        type: 'telegram',
        status: 'active',
        config: {
          platform: 'telegram'
        }
      });
      
      this.agentId = agent.id!;
      
      // Initialize Telegram bot if token is available
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      if (telegramToken) {
        this.bot = new Telegraf(telegramToken);
        this.setupBotHandlers();
        AgentLogger.log(LogLevel.INFO, 'TelegramAgent', 'Telegram Agent initialized with bot');
      } else {
        AgentLogger.log(LogLevel.WARN, 'TelegramAgent', 'Telegram token not found, bot functionality disabled');
      }
      
      AgentLogger.log(LogLevel.SUCCESS, 'TelegramAgent', 'Telegram Agent initialized with ID:', { agentId: this.agentId });
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'TelegramAgent', 'Failed to initialize Telegram Agent', {}, error as Error);
      throw error;
    }
  }

  /**
   * Setup bot handlers for common interactions
   */
  private setupBotHandlers(): void {
    if (!this.bot) return;
    
    // Handle start command
    this.bot.start((ctx) => {
      ctx.reply('Welcome to the Aether Network! I\'m your community assistant.');
    });
    
    // Handle help command
    this.bot.help((ctx) => {
      ctx.reply('I can help you stay updated with our latest content. New videos are posted automatically!');
    });
    
    // Handle echo command (for testing)
    this.bot.command('echo', (ctx) => {
      const message = ctx.message.text.split(' ').slice(1).join(' ') || 'Echo!';
      ctx.reply(message);
    });
    
    AgentLogger.log(LogLevel.INFO, 'TelegramAgent', 'Bot handlers configured');
  }

  /**
   * Start the Telegram bot
   */
  startBot(): void {
    if (this.bot) {
      this.bot.launch();
      AgentLogger.log(LogLevel.SUCCESS, 'TelegramAgent', 'Telegram bot started');
    } else {
      AgentLogger.log(LogLevel.WARN, 'TelegramAgent', 'Cannot start bot - not initialized');
    }
  }

  /**
   * Stop the Telegram bot
   */
  stopBot(): void {
    if (this.bot) {
      this.bot.stop();
      AgentLogger.log(LogLevel.INFO, 'TelegramAgent', 'Telegram bot stopped');
    }
  }

  /**
   * Post a message to a Telegram channel
   */
  async postToChannel(channelId: string, message: string): Promise<void> {
    try {
      if (!this.bot) {
        throw new Error('Telegram bot not initialized');
      }
      
      await this.bot.telegram.sendMessage(channelId, message);
      AgentLogger.log(LogLevel.SUCCESS, 'TelegramAgent', 'Message posted to channel', { channelId });
      
      // Record analytics
      await this.dbService.recordMetric({
        agentId: this.agentId,
        metricName: 'message_sent',
        value: 1,
        metadata: { channelId, messageLength: message.length }
      });
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'TelegramAgent', 'Failed to post message to channel', { channelId }, error as Error);
      throw error;
    }
  }

  /**
   * Announce a new YouTube video
   */
  async announceNewVideo(videoTitle: string, videoUrl: string, channelId: string): Promise<void> {
    try {
      const message = `🎬 New Video Alert!

${videoTitle}

Watch now: ${videoUrl}

#NewVideo #Content`;
      await this.postToChannel(channelId, message);
      
      AgentLogger.log(LogLevel.SUCCESS, 'TelegramAgent', 'New video announcement posted', { videoTitle });
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'TelegramAgent', 'Failed to announce new video', { videoTitle }, error as Error);
      throw error;
    }
  }

  /**
   * Run a poll in a Telegram group
   */
  async runPoll(chatId: string, question: string, options: string[]): Promise<void> {
    try {
      if (!this.bot) {
        throw new Error('Telegram bot not initialized');
      }
      
      await this.bot.telegram.sendPoll(chatId, question, options);
      AgentLogger.log(LogLevel.SUCCESS, 'TelegramAgent', 'Poll sent to chat', { chatId, question });
      
      // Record analytics
      await this.dbService.recordMetric({
        agentId: this.agentId,
        metricName: 'poll_sent',
        value: 1,
        metadata: { chatId, question }
      });
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'TelegramAgent', 'Failed to send poll', { chatId, question }, error as Error);
      throw error;
    }
  }

  /**
   * Share behind-the-scenes content
   */
  async shareBehindTheScenes(content: string, mediaUrl: string, chatId: string): Promise<void> {
    try {
      if (!this.bot) {
        throw new Error('Telegram bot not initialized');
      }
      
      // For now, we'll send as a text message with link
      // In a real implementation, this could send actual media
      const message = `📸 Behind the Scenes

${content}

See more: ${mediaUrl}`;
      await this.bot.telegram.sendMessage(chatId, message);
      
      AgentLogger.log(LogLevel.SUCCESS, 'TelegramAgent', 'Behind-the-scenes content shared', { chatId });
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'TelegramAgent', 'Failed to share behind-the-scenes content', { chatId }, error as Error);
      throw error;
    }
  }
}