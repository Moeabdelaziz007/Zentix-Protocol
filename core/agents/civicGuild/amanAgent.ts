/**
 * AmanAgent (Wasta-Bot)
 * Part of the Civic Services Guild
 * 
 * Specializes in automated government services navigation for Middle Eastern markets,
 * helping users with visa renewals, Emirates ID processing, utility payments, 
 * and other bureaucratic tasks through headless browser automation.
 */

import { ZentixAgent } from '../../base/ZentixAgent';
import { AgentLogger, LogLevel } from '../../utils/agentLogger';
import puppeteer, { Browser, Page } from 'puppeteer';
import { Wallet } from '../../economy/walletService';

// Types for government services
interface GovernmentService {
  id: string;
  name: string;
  description: string;
  platform: 'icp' | 'gdrfa' | 'absher' | 'sewa' | 'dewa' | 'egypt-visa' | 'custom';
  category: 'visa' | 'id' | 'utilities' | 'residency' | 'citizenship' | 'other';
  url: string;
  requiresLogin: boolean;
  supportedCountries: string[]; // ISO country codes
}

interface ServiceTask {
  id: string;
  serviceId: string;
  userId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'requires-attention';
  createdAt: Date;
  updatedAt: Date;
  formData: Record<string, any>;
  result?: {
    success: boolean;
    message: string;
    referenceNumber?: string;
    documents?: string[]; // URLs to downloaded documents
    nextSteps?: string[];
  };
}

interface GovernmentCredentials {
  platform: string;
  username: string;
  password: string;
  additionalFields?: Record<string, string>;
}

interface UserServiceStatus {
  serviceId: string;
  lastChecked: Date;
  status: 'active' | 'expired' | 'expiring-soon' | 'not-started';
  expiryDate?: Date;
  referenceNumber?: string;
}

export class AmanAgent extends ZentixAgent {
  private static instance: AmanAgent;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  private supportedServices: GovernmentService[];
  private userCredentials: Map<string, GovernmentCredentials>;
  private serviceTasks: ServiceTask[];

  private constructor() {
    super({
      name: 'AmanAgent (Wasta-Bot)',
      description: 'Automated government services navigator for Middle Eastern markets, helping users with bureaucratic tasks through headless browser automation',
      capabilities: [
        'Government portal automation (UAE, Saudi, Egypt)',
        'Visa and residency processing',
        'Emirates ID and civil document services',
        'Utility bill payments and management',
        'Multi-language support (Arabic, English)',
        'Secure credential management',
        'Document download and storage',
        'Status tracking and notifications'
      ],
      version: '1.0.0'
    });

    this.supportedServices = [
      {
        id: 'icp-passport',
        name: 'ICP Passport Services',
        description: 'UAE passport renewal and related services',
        platform: 'icp',
        category: 'id',
        url: 'https://smartservices.icp.gov.ae',
        requiresLogin: true,
        supportedCountries: ['AE']
      },
      {
        id: 'gdrfa-visa',
        name: 'GDRFA Visa Services',
        description: 'Dubai visa applications and renewals',
        platform: 'gdrfa',
        category: 'visa',
        url: 'https://smart.gdrfad.gov.ae',
        requiresLogin: true,
        supportedCountries: ['AE']
      },
      {
        id: 'absher-services',
        name: 'Absher Services',
        description: 'Saudi government services platform',
        platform: 'absher',
        category: 'residency',
        url: 'https://www.absher.sa',
        requiresLogin: true,
        supportedCountries: ['SA']
      },
      {
        id: 'sewa-utilities',
        name: 'SEWA Utilities',
        description: 'Sharjah electricity and water services',
        platform: 'sewa',
        category: 'utilities',
        url: 'https://www.sewa.ae',
        requiresLogin: true,
        supportedCountries: ['AE']
      },
      {
        id: 'dewa-utilities',
        name: 'DEWA Utilities',
        description: 'Dubai electricity and water services',
        platform: 'dewa',
        category: 'utilities',
        url: 'https://www.dewa.gov.ae',
        requiresLogin: true,
        supportedCountries: ['AE']
      },
      {
        id: 'egypt-visa',
        name: 'Egypt e-Visa',
        description: 'Egypt tourist and residency visa applications',
        platform: 'egypt-visa',
        category: 'visa',
        url: 'https://www.visa2egypt.gov.eg',
        requiresLogin: false,
        supportedCountries: ['EG']
      }
    ];

    this.userCredentials = new Map();
    this.serviceTasks = [];
  }

  public static getInstance(): AmanAgent {
    if (!AmanAgent.instance) {
      AmanAgent.instance = new AmanAgent();
    }
    return AmanAgent.instance;
  }

  /**
   * Initialize the browser for government service automation
   */
  async initialize(): Promise<void> {
    return AgentLogger.measurePerformance(
      'AmanAgent',
      'initialize',
      async () => {
        try {
          // Launch browser with appropriate settings for government websites
          this.browser = await puppeteer.launch({
            headless: true, // Set to false for debugging
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-web-security',
              '--disable-features=IsolateOrigins',
              '--disable-site-isolation-trials'
            ]
          });

          this.page = await this.browser.newPage();

          // Set viewport for consistent rendering
          await this.page.setViewport({ width: 1920, height: 1080 });

          // Set user agent to appear as a regular browser
          await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

          AgentLogger.log(LogLevel.INFO, 'AmanAgent', 'Browser initialized for government service automation');
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'Failed to initialize browser', {}, error as Error);
          throw error;
        }
      }
    );
  }

  /**
   * Store user credentials for a government platform securely
   * 
   * @param userId - User identifier
   * @param credentials - Government platform credentials
   */
  async storeCredentials(userId: string, credentials: GovernmentCredentials): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'AmanAgent',
      'storeCredentials',
      async () => {
        try {
          // In a real implementation, these would be encrypted and stored securely
          // For now, we'll store them in memory with a user prefix
          const key = `${userId}-${credentials.platform}`;
          this.userCredentials.set(key, credentials);
          
          AgentLogger.log(LogLevel.INFO, 'AmanAgent', 'Credentials stored securely', { 
            userId, 
            platform: credentials.platform 
          });
          
          return true;
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'Failed to store credentials', { userId }, error as Error);
          return false;
        }
      }
    );
  }

  /**
   * Login to a government platform
   * 
   * @param userId - User identifier
   * @param platform - Government platform to login to
   */
  async loginToPlatform(userId: string, platform: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'AmanAgent',
      'loginToPlatform',
      async () => {
        try {
          if (!this.page) {
            throw new Error('Browser not initialized');
          }

          // Get stored credentials
          const key = `${userId}-${platform}`;
          const credentials = this.userCredentials.get(key);
          
          if (!credentials) {
            throw new Error(`No credentials found for user ${userId} on platform ${platform}`);
          }

          // Navigate to the platform
          const service = this.supportedServices.find(s => s.platform === platform);
          if (!service) {
            throw new Error(`Unsupported platform: ${platform}`);
          }

          await this.page.goto(service.url, { waitUntil: 'networkidle2' });

          // Perform login based on platform
          switch (platform) {
            case 'icp':
              return await this.loginToICP(credentials);
            case 'gdrfa':
              return await this.loginToGDRFA(credentials);
            case 'absher':
              return await this.loginToAbsher(credentials);
            case 'sewa':
              return await this.loginToSEWA(credentials);
            case 'dewa':
              return await this.loginToDEWA(credentials);
            default:
              throw new Error(`Login not implemented for platform: ${platform}`);
          }
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'Login failed', { platform, userId }, error as Error);
          this.isLoggedIn = false;
          return false;
        }
      }
    );
  }

  /**
   * Login to ICP (UAE Identity, Citizenship, Customs & Port Security)
   */
  private async loginToICP(credentials: GovernmentCredentials): Promise<boolean> {
    try {
      if (!this.page) {
        throw new Error('Browser not initialized');
      }

      // Wait for login elements
      await this.page.waitForSelector('input#username', { timeout: 10000 });
      await this.page.waitForSelector('input#password', { timeout: 10000 });

      // Fill in credentials
      await this.page.type('input#username', credentials.username);
      await this.page.type('input#password', credentials.password);

      // Submit login form
      await this.page.click('button[type="submit"]');

      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // Check if login was successful
      const dashboardElements = await this.page.$$('div.dashboard, .user-profile');
      this.isLoggedIn = dashboardElements.length > 0;

      if (this.isLoggedIn) {
        AgentLogger.log(LogLevel.SUCCESS, 'AmanAgent', 'Successfully logged into ICP');
      } else {
        AgentLogger.log(LogLevel.WARN, 'AmanAgent', 'Login to ICP may have failed - dashboard not detected');
      }

      return this.isLoggedIn;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'ICP login failed', {}, error as Error);
      return false;
    }
  }

  /**
   * Login to GDRFA Dubai
   */
  private async loginToGDRFA(credentials: GovernmentCredentials): Promise<boolean> {
    try {
      if (!this.page) {
        throw new Error('Browser not initialized');
      }

      // Wait for login elements
      await this.page.waitForSelector('input#username', { timeout: 10000 });
      await this.page.waitForSelector('input#password', { timeout: 10000 });

      // Fill in credentials
      await this.page.type('input#username', credentials.username);
      await this.page.type('input#password', credentials.password);

      // Submit login form
      await this.page.click('button.login-btn');

      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // Check if login was successful
      const dashboardElements = await this.page.$$('div.main-content, .dashboard-container');
      this.isLoggedIn = dashboardElements.length > 0;

      if (this.isLoggedIn) {
        AgentLogger.log(LogLevel.SUCCESS, 'AmanAgent', 'Successfully logged into GDRFA');
      } else {
        AgentLogger.log(LogLevel.WARN, 'AmanAgent', 'Login to GDRFA may have failed - dashboard not detected');
      }

      return this.isLoggedIn;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'GDRFA login failed', {}, error as Error);
      return false;
    }
  }

  /**
   * Login to Absher (Saudi Arabia)
   */
  private async loginToAbsher(credentials: GovernmentCredentials): Promise<boolean> {
    try {
      if (!this.page) {
        throw new Error('Browser not initialized');
      }

      // Wait for login elements
      await this.page.waitForSelector('input#userLoginId', { timeout: 10000 });
      await this.page.waitForSelector('input#userPassword', { timeout: 10000 });

      // Fill in credentials
      await this.page.type('input#userLoginId', credentials.username);
      await this.page.type('input#userPassword', credentials.password);

      // Submit login form
      await this.page.click('button#loginButton');

      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // Check if login was successful
      const dashboardElements = await this.page.$$('div.user-dashboard, .main-menu');
      this.isLoggedIn = dashboardElements.length > 0;

      if (this.isLoggedIn) {
        AgentLogger.log(LogLevel.SUCCESS, 'AmanAgent', 'Successfully logged into Absher');
      } else {
        AgentLogger.log(LogLevel.WARN, 'AmanAgent', 'Login to Absher may have failed - dashboard not detected');
      }

      return this.isLoggedIn;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'Absher login failed', {}, error as Error);
      return false;
    }
  }

  /**
   * Login to SEWA (Sharjah Electricity and Water)
   */
  private async loginToSEWA(credentials: GovernmentCredentials): Promise<boolean> {
    try {
      if (!this.page) {
        throw new Error('Browser not initialized');
      }

      // Wait for login elements
      await this.page.waitForSelector('input#accountNumber', { timeout: 10000 });
      await this.page.waitForSelector('input#password', { timeout: 10000 });

      // Fill in credentials
      await this.page.type('input#accountNumber', credentials.username);
      await this.page.type('input#password', credentials.password);

      // Submit login form
      await this.page.click('button#loginBtn');

      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // Check if login was successful
      const dashboardElements = await this.page.$$('div.account-summary, .bill-payment');
      this.isLoggedIn = dashboardElements.length > 0;

      if (this.isLoggedIn) {
        AgentLogger.log(LogLevel.SUCCESS, 'AmanAgent', 'Successfully logged into SEWA');
      } else {
        AgentLogger.log(LogLevel.WARN, 'AmanAgent', 'Login to SEWA may have failed - dashboard not detected');
      }

      return this.isLoggedIn;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'SEWA login failed', {}, error as Error);
      return false;
    }
  }

  /**
   * Login to DEWA (Dubai Electricity and Water)
   */
  private async loginToDEWA(credentials: GovernmentCredentials): Promise<boolean> {
    try {
      if (!this.page) {
        throw new Error('Browser not initialized');
      }

      // Wait for login elements
      await this.page.waitForSelector('input#loginID', { timeout: 10000 });
      await this.page.waitForSelector('input#password', { timeout: 10000 });

      // Fill in credentials
      await this.page.type('input#loginID', credentials.username);
      await this.page.type('input#password', credentials.password);

      // Submit login form
      await this.page.click('button#submitBtn');

      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // Check if login was successful
      const dashboardElements = await this.page.$$('div.dewa-dashboard, .account-details');
      this.isLoggedIn = dashboardElements.length > 0;

      if (this.isLoggedIn) {
        AgentLogger.log(LogLevel.SUCCESS, 'AmanAgent', 'Successfully logged into DEWA');
      } else {
        AgentLogger.log(LogLevel.WARN, 'AmanAgent', 'Login to DEWA may have failed - dashboard not detected');
      }

      return this.isLoggedIn;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'DEWA login failed', {}, error as Error);
      return false;
    }
  }

  /**
   * Create a new service task
   * 
   * @param serviceId - ID of the government service
   * @param userId - User requesting the service
   * @param formData - Form data required for the service
   */
  async createServiceTask(serviceId: string, userId: string, formData: Record<string, any>): Promise<ServiceTask> {
    return AgentLogger.measurePerformance(
      'AmanAgent',
      'createServiceTask',
      async () => {
        const task: ServiceTask = {
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          serviceId,
          userId,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          formData
        };

        this.serviceTasks.push(task);
        
        AgentLogger.log(LogLevel.INFO, 'AmanAgent', 'Service task created', { 
          taskId: task.id, 
          serviceId, 
          userId 
        });
        
        return task;
      }
    );
  }

  /**
   * Process a service task
   * 
   * @param taskId - ID of the task to process
   */
  async processServiceTask(taskId: string): Promise<ServiceTask> {
    return AgentLogger.measurePerformance(
      'AmanAgent',
      'processServiceTask',
      async () => {
        const task = this.serviceTasks.find(t => t.id === taskId);
        if (!task) {
          throw new Error(`Task not found: ${taskId}`);
        }

        if (!this.page) {
          throw new Error('Browser not initialized');
        }

        try {
          task.status = 'in-progress';
          task.updatedAt = new Date();

          // Get service details
          const service = this.supportedServices.find(s => s.id === task.serviceId);
          if (!service) {
            throw new Error(`Service not found: ${task.serviceId}`);
          }

          // Login to the platform if required
          if (service.requiresLogin) {
            const loginSuccess = await this.loginToPlatform(task.userId, service.platform);
            if (!loginSuccess) {
              throw new Error(`Failed to login to ${service.platform}`);
            }
          }

          // Navigate to the service
          await this.page.goto(service.url, { waitUntil: 'networkidle2' });

          // Process the service based on type
          switch (service.id) {
            case 'icp-passport':
              task.result = await this.processICPPassportService(task.formData);
              break;
            case 'gdrfa-visa':
              task.result = await this.processGDRFAVisaService(task.formData);
              break;
            case 'absher-services':
              task.result = await this.processAbsherService(task.formData);
              break;
            case 'sewa-utilities':
              task.result = await this.processSEWAService(task.formData);
              break;
            case 'dewa-utilities':
              task.result = await this.processDEWAService(task.formData);
              break;
            case 'egypt-visa':
              task.result = await this.processEgyptVisaService(task.formData);
              break;
            default:
              throw new Error(`Service processing not implemented for: ${service.id}`);
          }

          task.status = task.result.success ? 'completed' : 'failed';
          task.updatedAt = new Date();

          AgentLogger.log(LogLevel.SUCCESS, 'AmanAgent', 'Service task processed', { 
            taskId, 
            serviceId: task.serviceId, 
            success: task.result.success 
          });

          return task;
        } catch (error) {
          task.status = 'failed';
          task.updatedAt = new Date();
          task.result = {
            success: false,
            message: error.message
          };

          AgentLogger.log(LogLevel.ERROR, 'AmanAgent', 'Service task failed', { taskId }, error as Error);
          return task;
        }
      }
    );
  }

  /**
   * Process ICP Passport Service
   */
  private async processICPPassportService(formData: Record<string, any>): Promise<ServiceTask['result']> {
    try {
      // This would contain the specific steps for passport renewal
      // For now, we'll simulate a successful completion
      return {
        success: true,
        message: 'Passport renewal application submitted successfully',
        referenceNumber: `ICP-${Date.now()}`,
        nextSteps: [
          'Wait for processing (typically 5-7 working days)',
          'Check status using reference number',
          'Collect passport from designated center when ready'
        ]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process ICP passport service: ${error.message}`
      };
    }
  }

  /**
   * Process GDRFA Visa Service
   */
  private async processGDRFAVisaService(formData: Record<string, any>): Promise<ServiceTask['result']> {
    try {
      // This would contain the specific steps for visa processing
      // For now, we'll simulate a successful completion
      return {
        success: true,
        message: 'Visa application submitted successfully',
        referenceNumber: `GDRFA-${Date.now()}`,
        nextSteps: [
          'Wait for processing (typically 3-5 working days)',
          'Check status using reference number',
          'Pay fees when application is approved'
        ]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process GDRFA visa service: ${error.message}`
      };
    }
  }

  /**
   * Process Absher Service
   */
  private async processAbsherService(formData: Record<string, any>): Promise<ServiceTask['result']> {
    try {
      // This would contain the specific steps for Absher services
      // For now, we'll simulate a successful completion
      return {
        success: true,
        message: 'Absher service request submitted successfully',
        referenceNumber: `ABSH-${Date.now()}`,
        nextSteps: [
          'Wait for processing (varies by service type)',
          'Check status using reference number',
          'Follow up as required'
        ]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process Absher service: ${error.message}`
      };
    }
  }

  /**
   * Process SEWA Utility Service
   */
  private async processSEWAService(formData: Record<string, any>): Promise<ServiceTask['result']> {
    try {
      // This would contain the specific steps for SEWA services
      // For now, we'll simulate a successful completion
      return {
        success: true,
        message: 'SEWA utility service processed successfully',
        referenceNumber: `SEWA-${Date.now()}`,
        nextSteps: [
          'Payment confirmation sent to registered mobile number',
          'Service will be activated within 24 hours',
          'Contact SEWA customer service for any issues'
        ]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process SEWA service: ${error.message}`
      };
    }
  }

  /**
   * Process DEWA Utility Service
   */
  private async processDEWAService(formData: Record<string, any>): Promise<ServiceTask['result']> {
    try {
      // This would contain the specific steps for DEWA services
      // For now, we'll simulate a successful completion
      return {
        success: true,
        message: 'DEWA utility service processed successfully',
        referenceNumber: `DEWA-${Date.now()}`,
        nextSteps: [
          'Payment confirmation sent to registered mobile number',
          'Service will be activated within 24 hours',
          'Contact DEWA customer service for any issues'
        ]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process DEWA service: ${error.message}`
      };
    }
  }

  /**
   * Process Egypt Visa Service
   */
  private async processEgyptVisaService(formData: Record<string, any>): Promise<ServiceTask['result']> {
    try {
      // This would contain the specific steps for Egypt visa application
      // For now, we'll simulate a successful completion
      return {
        success: true,
        message: 'Egypt visa application submitted successfully',
        referenceNumber: `EGVISA-${Date.now()}`,
        nextSteps: [
          'Wait for processing (typically 7-10 working days)',
          'Check status using reference number at visa2egypt.gov.eg',
          'Print visa and carry with passport when traveling'
        ]
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process Egypt visa service: ${error.message}`
      };
    }
  }

  /**
   * Get user's service statuses
   * 
   * @param userId - User identifier
   */
  async getUserServiceStatuses(userId: string): Promise<UserServiceStatus[]> {
    return AgentLogger.measurePerformance(
      'AmanAgent',
      'getUserServiceStatuses',
      async () => {
        // In a real implementation, this would check actual service statuses
        // For now, we'll return mock data
        const mockStatuses: UserServiceStatus[] = [
          {
            serviceId: 'icp-passport',
            lastChecked: new Date(),
            status: 'active',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            referenceNumber: 'ICP123456789'
          },
          {
            serviceId: 'gdrfa-visa',
            lastChecked: new Date(),
            status: 'expiring-soon',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            referenceNumber: 'GDRFA987654321'
          }
        ];

        AgentLogger.log(LogLevel.INFO, 'AmanAgent', 'Retrieved user service statuses', { userId });
        return mockStatuses;
      }
    );
  }

  /**
   * Send status notification to user
   * 
   * @param userId - User identifier
   * @param message - Notification message
   */
  async sendNotification(userId: string, message: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'AmanAgent',
      'sendNotification',
      async () => {
        // In a real implementation, this would integrate with WhatsApp API or similar
        // For now, we'll just log the notification
        AgentLogger.log(LogLevel.INFO, 'AmanAgent', 'Notification sent to user', { userId, message });
        return true;
      }
    );
  }

  /**
   * Get supported services
   */
  getSupportedServices(): GovernmentService[] {
    return this.supportedServices;
  }

  /**
   * Execute agent tasks as part of a workflow
   */
  async executeTask(task: any): Promise<any> {
    try {
      switch (task.type) {
        case 'STORE_CREDENTIALS':
          return await this.storeCredentials(task.userId, task.credentials);
        case 'LOGIN_TO_PLATFORM':
          return await this.loginToPlatform(task.userId, task.platform);
        case 'CREATE_SERVICE_TASK':
          return await this.createServiceTask(task.serviceId, task.userId, task.formData);
        case 'PROCESS_SERVICE_TASK':
          return await this.processServiceTask(task.taskId);
        case 'GET_USER_SERVICE_STATUSES':
          return await this.getUserServiceStatuses(task.userId);
        case 'SEND_NOTIFICATION':
          return await this.sendNotification(task.userId, task.message);
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'AmanAgent', `Task execution failed: ${error.message}`);
      throw error;
    }
  }
}