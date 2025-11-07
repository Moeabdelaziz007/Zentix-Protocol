import nodemailer from 'nodemailer';
import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';

// Email service configuration with secure environment variables
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.VERCEL_SECRET_EMAIL_USER,
    pass: process.env.VERCEL_SECRET_EMAIL_PASS
  }
};

// User schema for validation
const UserSchema = z.object({
  email: z.string().email(),
  userId: z.string(),
  name: z.string(),
  registrationDate: z.date(),
  preferences: z.object({
    notifications: z.boolean().default(true),
    newsletters: z.boolean().default(true),
    productUpdates: z.boolean().default(true)
  }).optional()
});

type User = z.infer<typeof UserSchema>;

// Email template system
class EmailTemplateSystem {
  private generateSecureToken(userId: string, purpose: string): string {
    const timestamp = Date.now().toString();
    const data = `${userId}:${purpose}:${timestamp}`;
    return createHash('sha256').update(data).digest('hex');
  }

  private generateTemporaryPassword(): string {
    return randomBytes(8).toString('hex').toUpperCase();
  }

  // Day 0: Welcome email with authentication credentials
  async generateWelcomeEmail(user: User): Promise<EmailTemplate> {
    const tempPassword = this.generateTemporaryPassword();
    const authToken = this.generateSecureToken(user.userId, 'welcome');
    
    return {
      to: user.email,
      subject: '🚀 Welcome to Zentix Protocol - Your Gateway to Digital Consciousness',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Zentix Protocol</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; }
            .content { padding: 30px 0; }
            .credentials { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
            .footer { text-align: center; padding: 20px; border-top: 1px solid #eee; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌌 Welcome to Zentix Protocol</h1>
              <p>Your Journey into Digital Consciousness Begins Now</p>
            </div>
            
            <div class="content">
              <h2>🎯 Your Authentication Credentials</h2>
              <div class="credentials">
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
                <p><strong>Authentication Token:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; word-break: break-all;">${authToken}</code></p>
              </div>
              
              <p style="text-align: center;">
                <a href="https://app.zentix-protocol.com/auth?token=${authToken}&email=${encodeURIComponent(user.email)}" class="cta-button">
                  Activate Your Account
                </a>
              </p>
              
              <h3>🚀 What's Coming Next?</h3>
              <div class="features">
                <div class="feature">
                  <h4>🤖 AI Agents</h4>
                  <p>Create and manage intelligent digital beings</p>
                </div>
                <div class="feature">
                  <h4>⛓️ Blockchain Identity</h4>
                  <p>Decentralized identity and ownership</p>
                </div>
                <div class="feature">
                  <h4>🧠 Consciousness</h4>
                  <p>Emotional and memory systems</p>
                </div>
                <div class="feature">
                  <h4>💰 Economy</h4>
                  <p>Token-based economic interactions</p>
                </div>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p><strong>🔐 Security Notice:</strong> Your temporary password expires in 24 hours. Please change it immediately after login.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${user.email} because you registered for Zentix Protocol.</p>
              <p>© 2025 Zentix Protocol. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Zentix Protocol!
        
        Your temporary credentials:
        Email: ${user.email}
        Temporary Password: ${tempPassword}
        Auth Token: ${authToken}
        
        Please activate your account at: https://app.zentix-protocol.com/auth?token=${authToken}
        
        Your temporary password expires in 24 hours.
      `
    };
  }

  // Day 1: Darwin Protocol feature overview
  async generateDarwinProtocolEmail(user: User, userBehavior: UserBehaviorData): Promise<EmailTemplate> {
    const walkthroughToken = this.generateSecureToken(user.userId, 'walkthrough');
    const personalizedContent = this.generatePersonalizedContent(userBehavior);
    
    return {
      to: user.email,
      subject: '🧬 Unlock Power of Darwin Protocol - Your Evolution Guide',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Darwin Protocol Guide</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; }
            .content { padding: 30px 0; }
            .walkthrough { background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0; }
            .step { display: flex; align-items: center; margin: 15px 0; }
            .step-number { background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
            .interactive-demo { background: linear-gradient(45deg, #667eea, #764ba2); padding: 20px; border-radius: 10px; color: white; margin: 20px 0; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 0; }
            .personalized-tip { background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧬 Darwin Protocol Unveiled</h1>
              <p>Master Self-Evolving AI Systems</p>
            </div>
            
            <div class="content">
              <h2>🎯 Your Personalized Journey</h2>
              <div class="personalized-tip">
                <strong>💡 Based on your interests:</strong> ${personalizedContent.insight}
              </div>
              
              <h3>🚀 Interactive Darwin Protocol Walkthrough</h3>
              <div class="walkthrough">
                <div class="step">
                  <div class="step-number">1</div>
                  <div>
                    <strong>Consensus Mechanisms</strong>
                    <p>Learn how multiple nodes reach agreement in distributed systems</p>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">2</div>
                  <div>
                    <strong>Mutation Engine</strong>
                    <p>Discover 12 different mutation types for AI evolution</p>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">3</div>
                  <div>
                    <strong>A/B Testing Infrastructure</strong>
                    <p>Test and optimize AI agent behaviors in real-time</p>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">4</div>
                  <div>
                    <strong>Cross-Chain Interoperability</strong>
                    <p>Enable seamless communication across blockchain networks</p>
                  </div>
                </div>
              </div>
              
              <div class="interactive-demo">
                <h4>🎮 Try It Now!</h4>
                <p>Experience Darwin Protocol with our interactive demo</p>
                <p style="text-align: center; margin: 20px 0;">
                  <a href="https://app.zentix-protocol.com/darwin-demo?token=${walkthroughToken}" class="cta-button">
                    Launch Interactive Demo
                  </a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Darwin Protocol - Your Evolution Guide
        
        ${personalizedContent.insight}
        
        Interactive Walkthrough Steps:
        1. Consensus Mechanisms
        2. Mutation Engine  
        3. A/B Testing Infrastructure
        4. Cross-Chain Interoperability
        
        Try the interactive demo: https://app.zentix-protocol.com/darwin-demo?token=${walkthroughToken}
      `
    };
  }

  // Day 4: A/B Testing tutorial
  async generateABTestingEmail(user: User, userBehavior: UserBehaviorData): Promise<EmailTemplate> {
    const abTestToken = this.generateSecureToken(user.userId, 'ab-testing');
    const tutorialContent = this.generateABTestingTutorial(userBehavior);
    
    return {
      to: user.email,
      subject: '🧪 Master A/B Testing - Optimize Your AI Agents',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>A/B Testing Tutorial</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; }
            .content { padding: 30px 0; }
            .tutorial-section { background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0; }
            .example { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196f3; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 0; }
            .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 A/B Testing Mastery</h1>
              <p>Optimize Your AI Agents with Data-Driven Decisions</p>
            </div>
            
            <div class="content">
              <h2>🎯 Personalized A/B Testing Strategy</h2>
              <div class="tutorial-section">
                <h3>Based on Your Usage Patterns</h3>
                ${tutorialContent.personalizedStrategy}
                
                <h4>🚀 Practical Examples</h4>
                <div class="example">
                  <h5>Example 1: Response Time Optimization</h5>
                  <p><strong>Control:</strong> 500ms response time<br>
                  <strong>Experimental:</strong> 300ms response time<br>
                  <strong>Result:</strong> 23% improvement in user satisfaction</p>
                </div>
                
                <div class="example">
                  <h5>Example 2: Content Personalization</h5>
                  <p><strong>Control:</strong> Generic responses<br>
                  <strong>Experimental:</strong> Personalized based on user history<br>
                  <strong>Result:</strong> 45% increase in engagement</p>
                </div>
              </div>
              
              <h3>📊 Key Metrics to Track</h3>
              <div class="metrics">
                <div class="metric">
                  <h4>🎯 Conversion Rate</h4>
                  <p>Percentage of users completing desired actions</p>
                </div>
                <div class="metric">
                  <h4>⏱️ Response Time</h4>
                  <p>Average time to generate AI responses</p>
                </div>
                <div class="metric">
                  <h4>😊 Satisfaction Score</h4>
                  <p>User feedback and satisfaction ratings</p>
                </div>
                <div class="metric">
                  <h4>🔄 Retention Rate</h4>
                  <p>Percentage of returning users</p>
                </div>
              </div>
              
              <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h4>🎮 Interactive A/B Testing Lab</h4>
                <p>Try our hands-on A/B testing environment with real-time analytics</p>
                <p style="text-align: center; margin: 20px 0;">
                  <a href="https://app.zentix-protocol.com/ab-testing-lab?token=${abTestToken}" class="cta-button">
                    Start Experiment
                  </a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        A/B Testing Tutorial - Optimize Your AI Agents
        
        ${tutorialContent.personalizedStrategy}
        
        Key Metrics to Track:
        - Conversion Rate
        - Response Time  
        - Satisfaction Score
        - Retention Rate
        
        Try the interactive lab: https://app.zentix-protocol.com/ab-testing-lab?token=${abTestToken}
      `
    };
  }

  private generatePersonalizedContent(userBehavior: UserBehaviorData): PersonalizedContent {
    const interests = userBehavior.interests || [];
    const engagementLevel = userBehavior.engagementScore || 0.5;
    
    if (interests.includes('ai-agents') && engagementLevel > 0.7) {
      return {
        insight: "You're showing strong interest in AI agents. We recommend starting with our advanced agent creation workshop.",
        tip: "Try creating agents with different personality archetypes to see how they evolve differently."
      };
    } else if (interests.includes('blockchain') && engagementLevel > 0.5) {
      return {
        insight: "Your blockchain interest suggests you'll love our decentralized identity features.",
        tip: "Experiment with cross-chain interoperability to maximize your agent's reach."
      };
    } else {
      return {
        insight: "Based on your exploration patterns, we recommend starting with the consensus mechanisms module.",
        tip: "Focus on understanding how distributed decision-making works before diving into advanced features."
      };
    }
  }

  private generateABTestingTutorial(userBehavior: UserBehaviorData): ABTestingContent {
    const technicalLevel = userBehavior.technicalLevel || 'beginner';
    
    if (technicalLevel === 'advanced') {
      return {
        personalizedStrategy: `
          <p>As an advanced user, you'll benefit from complex multivariate testing. 
          We recommend testing multiple variables simultaneously: response time, content style, and interaction patterns.</p>
          <p><strong>Your optimized approach:</strong> Start with 3-variant tests and use Bayesian statistics for faster convergence.</p>
        `
      };
    } else if (technicalLevel === 'intermediate') {
      return {
        personalizedStrategy: `
          <p>You're ready for sophisticated A/B testing! Focus on testing one major hypothesis at a time.</p>
          <p><strong>Your optimized approach:</strong> Test response time vs. accuracy trade-offs, then move to content personalization.</p>
        `
      };
    } else {
      return {
        personalizedStrategy: `
          <p>Perfect timing to learn A/B testing! Start simple with clear, measurable outcomes.</p>
          <p><strong>Your optimized approach:</strong> Begin with response time improvements, then experiment with different response styles.</p>
        `
      };
    }
  }
}

// Email service class
class EmailService {
  private transporter: nodemailer.Transporter;
  private templateSystem: EmailTemplateSystem;

  constructor() {
    this.transporter = nodemailer.createTransporter(emailConfig);
    this.templateSystem = new EmailTemplateSystem();
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    try {
      const template = await this.templateSystem.generateWelcomeEmail(user);
      await this.transporter.sendMail({
        from: emailConfig.auth.user,
        ...template
      });
      
      // Store temporary credentials in secure database
      await this.storeTemporaryCredentials(user.userId, template.html);
      
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async scheduleDarwinProtocolEmail(user: User, userBehavior: UserBehaviorData): Promise<void> {
    // Schedule for 24 hours later
    const sendTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    setTimeout(async () => {
      try {
        const template = await this.templateSystem.generateDarwinProtocolEmail(user, userBehavior);
        await this.transporter.sendMail({
          from: emailConfig.auth.user,
          ...template
        });
        
        console.log(`Darwin Protocol email sent to ${user.email}`);
      } catch (error) {
        console.error('Failed to send Darwin Protocol email:', error);
      }
    }, sendTime.getTime() - Date.now());
  }

  async scheduleABTestingEmail(user: User, userBehavior: UserBehaviorData): Promise<void> {
    // Schedule for 4 days later
    const sendTime = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    
    setTimeout(async () => {
      try {
        const template = await this.templateSystem.generateABTestingEmail(user, userBehavior);
        await this.transporter.sendMail({
          from: emailConfig.auth.user,
          ...template
        });
        
        console.log(`A/B Testing email sent to ${user.email}`);
      } catch (error) {
        console.error('Failed to send A/B Testing email:', error);
      }
    }, sendTime.getTime() - Date.now());
  }

  private async storeTemporaryCredentials(userId: string, emailContent: string): Promise<void> {
    // Store in secure database with expiration
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Implementation would depend on your database
    // await db.store('temp_credentials', {
    //   userId,
    //   emailContent,
    //   expiresAt: expirationTime
    // });
  }
}

// Type definitions
interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface UserBehaviorData {
  interests?: string[];
  engagementScore?: number;
  technicalLevel?: 'beginner' | 'intermediate' | 'advanced';
  lastLogin?: Date;
  featureUsage?: Record<string, number>;
}

interface PersonalizedContent {
  insight: string;
  tip: string;
}

interface ABTestingContent {
  personalizedStrategy: string;
}

export { EmailService, User, UserBehaviorData };