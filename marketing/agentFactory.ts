#!/usr/bin/env tsx
/**
 * Zentix Agent Factory - Marketing & Growth Engine
 * Self-sustaining agent creation system with referral rewards
 * 
 * Features:
 * - Free agent templates (powered by Manus free tokens)
 * - Referral system with automatic rewards
 * - Gamified challenges and points
 * - Zero-cost demo deployment
 */

import { AgentFactory } from '../core/integration/agentFactory';
import { EconomicService } from '../core/economic/economicService';
import { WalletService } from '../core/economy/walletService';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Agent template for users
 */
interface AgentTemplate {
  id: string;
  name: string;
  category: 'content' | 'sales' | 'analysis' | 'creative' | 'helper';
  description: string;
  skills: string[];
  useCase: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTokens: number;
}

/**
 * Marketing campaign statistics
 */
interface CampaignStats {
  totalUsers: number;
  totalAgentsCreated: number;
  totalReferrals: number;
  tokensDistributed: number;
  activeUsers: number;
  conversionRate: number;
}

/**
 * User profile for marketing
 */
interface MarketingUser {
  id: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  agentsCreated: number;
  tokensEarned: number;
  points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinedAt: string;
  lastActive: string;
}

/**
 * Agent Factory Marketing System
 */
class AgentFactoryMarketing {
  private static templates: AgentTemplate[] = [];
  private static users: Map<string, MarketingUser> = new Map();
  private static stats: CampaignStats = {
    totalUsers: 0,
    totalAgentsCreated: 0,
    totalReferrals: 0,
    tokensDistributed: 0,
    activeUsers: 0,
    conversionRate: 0,
  };

  /**
   * Initialize agent templates
   */
  static initializeTemplates(): void {
    this.templates = [
      {
        id: 'content-writer',
        name: 'Content Writer Agent',
        category: 'content',
        description: 'AI agent that generates blog posts, articles, and marketing copy',
        skills: ['content_generation', 'seo_optimization', 'copywriting'],
        useCase: 'Perfect for bloggers, marketers, and content creators',
        difficulty: 'beginner',
        estimatedTokens: 50000,
      },
      {
        id: 'sales-emailer',
        name: 'Sales Email Agent',
        category: 'sales',
        description: 'Generates personalized sales emails and follow-ups',
        skills: ['email_writing', 'persuasion', 'personalization'],
        useCase: 'Ideal for sales teams and business development',
        difficulty: 'beginner',
        estimatedTokens: 30000,
      },
      {
        id: 'data-analyst',
        name: 'Data Analyst Agent',
        category: 'analysis',
        description: 'Analyzes datasets and generates insights',
        skills: ['data_analysis', 'visualization', 'reporting'],
        useCase: 'Great for researchers and data scientists',
        difficulty: 'intermediate',
        estimatedTokens: 100000,
      },
      {
        id: 'creative-designer',
        name: 'Creative Designer Agent',
        category: 'creative',
        description: 'Generates design concepts and creative briefs',
        skills: ['design_thinking', 'creativity', 'branding'],
        useCase: 'Perfect for designers and creative teams',
        difficulty: 'intermediate',
        estimatedTokens: 75000,
      },
      {
        id: 'customer-support',
        name: 'Customer Support Agent',
        category: 'helper',
        description: 'Handles customer inquiries and support tickets',
        skills: ['support', 'communication', 'problem_solving'],
        useCase: 'Essential for customer service teams',
        difficulty: 'beginner',
        estimatedTokens: 40000,
      },
      {
        id: 'resume-analyzer',
        name: 'Resume Analyzer Agent',
        category: 'analysis',
        description: 'Reviews resumes and provides improvement suggestions',
        skills: ['resume_analysis', 'hr_insights', 'feedback'],
        useCase: 'Useful for recruiters and job seekers',
        difficulty: 'beginner',
        estimatedTokens: 25000,
      },
    ];

    console.log(`✅ Loaded ${this.templates.length} agent templates`);
  }

  /**
   * Create user with referral code
   */
  static createUser(email: string, referredBy?: string): MarketingUser {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const referralCode = this.generateReferralCode();

    const user: MarketingUser = {
      id: userId,
      email,
      referralCode,
      referredBy,
      agentsCreated: 0,
      tokensEarned: 0,
      points: 0,
      level: 'bronze',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    this.users.set(userId, user);
    this.stats.totalUsers++;

    // Reward referrer
    if (referredBy) {
      this.processReferral(referredBy, userId);
    }

    // Welcome bonus
    user.tokensEarned += 50;
    user.points += 10;
    this.stats.tokensDistributed += 50;

    console.log(`\n🎉 New user registered: ${email}`);
    console.log(`   Referral Code: ${referralCode}`);
    console.log(`   Welcome Bonus: 50 ZXT + 10 Points`);
    if (referredBy) {
      console.log(`   Referred by: ${referredBy}`);
    }

    return user;
  }

  /**
   * Process referral and reward
   */
  private static processReferral(referrerCode: string, newUserId: string): void {
    // Find referrer by code
    const referrer = Array.from(this.users.values()).find(
      (u) => u.referralCode === referrerCode
    );

    if (referrer) {
      referrer.tokensEarned += 100; // Referral reward
      referrer.points += 20;
      this.stats.totalReferrals++;
      this.stats.tokensDistributed += 100;

      console.log(`   💰 Referrer ${referrer.email} earned 100 ZXT + 20 Points!`);
    }
  }

  /**
   * Generate unique referral code
   */
  private static generateReferralCode(): string {
    return `ZTX${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Create agent from template
   */
  static async createAgentFromTemplate(
    userId: string,
    templateId: string,
    customName?: string
  ): Promise<any> {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    console.log(`\n🔨 Creating agent from template: ${template.name}`);
    console.log(`   User: ${user.email}`);
    console.log(`   Estimated tokens: ${template.estimatedTokens}`);

    // Create agent using Zentix factory
    const agent = AgentFactory.createCompleteAgent({
      name: customName || template.name,
      archetype: this.mapCategoryToArchetype(template.category),
      tone: 'professional and helpful',
      values: ['efficiency', 'quality', 'innovation'],
      skills: template.skills.map((s) => ({
        name: s,
        description: `${s} capability`,
      })),
      workspace_id: `user-${userId}`,
      initial_balance: 10,
    });

    // Update user stats
    user.agentsCreated++;
    user.points += 50; // Points for creating agent
    user.tokensEarned += 25; // Bonus for creation
    user.lastActive = new Date().toISOString();
    this.stats.totalAgentsCreated++;
    this.stats.tokensDistributed += 25;

    // Level up if needed
    this.updateUserLevel(user);

    console.log(`   ✅ Agent created: ${agent.aix_did.aix.name}`);
    console.log(`   Reward: 50 Points + 25 ZXT`);
    console.log(`   Total agents: ${user.agentsCreated}`);
    console.log(`   User level: ${user.level}`);

    return agent;
  }

  /**
   * Map category to archetype
   */
  private static mapCategoryToArchetype(
    category: string
  ): 'analyst' | 'creative' | 'helper' | 'guardian' | 'explorer' {
    const mapping: Record<string, any> = {
      content: 'creative',
      sales: 'helper',
      analysis: 'analyst',
      creative: 'creative',
      helper: 'helper',
    };
    return mapping[category] || 'helper';
  }

  /**
   * Update user level based on points
   */
  private static updateUserLevel(user: MarketingUser): void {
    const oldLevel = user.level;

    if (user.points >= 1000) {
      user.level = 'platinum';
    } else if (user.points >= 500) {
      user.level = 'gold';
    } else if (user.points >= 200) {
      user.level = 'silver';
    } else {
      user.level = 'bronze';
    }

    if (oldLevel !== user.level) {
      console.log(`   🎊 LEVEL UP! ${oldLevel} → ${user.level}`);
      // Bonus for level up
      user.tokensEarned += 200;
      this.stats.tokensDistributed += 200;
    }
  }

  /**
   * Get all templates
   */
  static getTemplates(category?: string): AgentTemplate[] {
    if (category) {
      return this.templates.filter((t) => t.category === category);
    }
    return this.templates;
  }

  /**
   * Get user statistics
   */
  static getUserStats(userId: string): MarketingUser | undefined {
    return this.users.get(userId);
  }

  /**
   * Get campaign statistics
   */
  static getCampaignStats(): CampaignStats {
    this.stats.activeUsers = Array.from(this.users.values()).filter((u) => {
      const lastActive = new Date(u.lastActive);
      const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length;

    this.stats.conversionRate =
      this.stats.totalUsers > 0
        ? (this.stats.totalAgentsCreated / this.stats.totalUsers) * 100
        : 0;

    return { ...this.stats };
  }

  /**
   * Generate landing page HTML
   */
  static generateLandingPage(): string {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zentix Agent Factory - Build AI Agents for Free</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .hero { text-align: center; margin-bottom: 60px; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 20px; }
        .hero p { font-size: 1.5rem; opacity: 0.9; }
        .cta-box {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            margin: 40px 0;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .cta-box h2 { font-size: 2rem; margin-bottom: 15px; }
        .cta-box .highlight {
            font-size: 3rem;
            color: #ffd700;
            font-weight: bold;
            display: block;
            margin: 20px 0;
        }
        .templates {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .template-card {
            background: rgba(255,255,255,0.15);
            padding: 30px;
            border-radius: 15px;
            transition: transform 0.3s;
        }
        .template-card:hover { transform: translateY(-5px); }
        .template-card h3 { margin-bottom: 10px; }
        .btn {
            background: #ffd700;
            color: #333;
            padding: 15px 40px;
            border: none;
            border-radius: 30px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
        }
        .btn:hover { background: #ffed4e; }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 40px 0;
        }
        .stat { text-align: center; }
        .stat .number { font-size: 3rem; font-weight: bold; color: #ffd700; }
        .stat .label { font-size: 1rem; opacity: 0.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>🤖 Build Your AI Agent Empire</h1>
            <p>Powered by Manus - 1 Trillion Free AI Tokens</p>
        </div>

        <div class="cta-box">
            <h2>🎁 Start Building for FREE</h2>
            <span class="highlight">1 TRILLION</span>
            <p style="font-size: 1.3rem;">Free AI tokens to create unlimited agents</p>
            <p style="margin: 20px 0;">✅ No credit card • ✅ No hidden fees • ✅ Start in 60 seconds</p>
            <button class="btn">Get Started Free</button>
            <button class="btn" style="background: transparent; border: 2px solid #ffd700;">View Templates</button>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="number">${this.stats.totalUsers}</div>
                <div class="label">Happy Builders</div>
            </div>
            <div class="stat">
                <div class="number">${this.stats.totalAgentsCreated}</div>
                <div class="label">Agents Created</div>
            </div>
            <div class="stat">
                <div class="number">${this.stats.tokensDistributed}</div>
                <div class="label">ZXT Distributed</div>
            </div>
        </div>

        <h2 style="text-align: center; margin: 60px 0 30px;">🚀 Popular Agent Templates</h2>
        <div class="templates">
            ${this.templates
              .slice(0, 6)
              .map(
                (t) => `
            <div class="template-card">
                <h3>${t.name}</h3>
                <p style="opacity: 0.8; margin: 10px 0;">${t.description}</p>
                <p style="margin-top: 15px;">
                    <strong>Use Case:</strong> ${t.useCase}
                </p>
                <p style="margin-top: 10px;">
                    <strong>Level:</strong> ${t.difficulty}
                </p>
            </div>
            `
              )
              .join('')}
        </div>

        <div class="cta-box" style="text-align: center;">
            <h2>🎁 Referral Rewards</h2>
            <p style="font-size: 1.3rem; margin: 20px 0;">Invite friends and earn <strong>100 ZXT</strong> per referral!</p>
            <p>Plus automatic points for every agent you create</p>
            <button class="btn">Get Your Referral Link</button>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Export stats to JSON
   */
  static exportStats(): any {
    return {
      campaign: this.stats,
      users: Array.from(this.users.values()).map((u) => ({
        email: u.email,
        level: u.level,
        agents: u.agentsCreated,
        tokens: u.tokensEarned,
        points: u.points,
      })),
      templates: this.templates,
    };
  }
}

// Demo execution
async function runMarketingDemo() {
  console.log('\n🌟 Zentix Agent Factory - Marketing Demo\n');
  console.log('═'.repeat(60) + '\n');

  // Initialize templates
  AgentFactoryMarketing.initializeTemplates();

  // Simulate user signups
  console.log('\n📝 User Signups:\n');

  const user1 = AgentFactoryMarketing.createUser('alice@example.com');
  const user2 = AgentFactoryMarketing.createUser('bob@example.com', user1.referralCode);
  const user3 = AgentFactoryMarketing.createUser(
    'charlie@example.com',
    user1.referralCode
  );

  // Create agents from templates
  console.log('\n🤖 Creating Agents from Templates:\n');

  await AgentFactoryMarketing.createAgentFromTemplate(
    user1.id,
    'content-writer',
    'Alice Content Bot'
  );
  await AgentFactoryMarketing.createAgentFromTemplate(
    user1.id,
    'sales-emailer',
    'Alice Sales Assistant'
  );
  await AgentFactoryMarketing.createAgentFromTemplate(
    user2.id,
    'data-analyst',
    'Bob Analytics Pro'
  );
  await AgentFactoryMarketing.createAgentFromTemplate(
    user3.id,
    'customer-support',
    'Charlie Support Agent'
  );

  // Show campaign stats
  console.log('\n📊 Campaign Statistics:\n');
  const stats = AgentFactoryMarketing.getCampaignStats();
  console.log(`   Total Users: ${stats.totalUsers}`);
  console.log(`   Total Agents Created: ${stats.totalAgentsCreated}`);
  console.log(`   Total Referrals: ${stats.totalReferrals}`);
  console.log(`   Tokens Distributed: ${stats.tokensDistributed} ZXT`);
  console.log(`   Active Users (7 days): ${stats.activeUsers}`);
  console.log(`   Conversion Rate: ${stats.conversionRate.toFixed(1)}%\n`);

  // Show user stats
  console.log('👥 Top Users:\n');
  [user1, user2, user3].forEach((u) => {
    const user = AgentFactoryMarketing.getUserStats(u.id)!;
    console.log(`   ${user.email}`);
    console.log(`      Level: ${user.level}`);
    console.log(`      Agents: ${user.agentsCreated}`);
    console.log(`      Tokens: ${user.tokensEarned} ZXT`);
    console.log(`      Points: ${user.points}`);
    console.log(`      Referral Code: ${user.referralCode}\n`);
  });

  // Generate landing page
  console.log('🌐 Generating Landing Page...\n');
  const html = AgentFactoryMarketing.generateLandingPage();
  const outputPath = path.join(__dirname, 'landing.html');
  fs.writeFileSync(outputPath, html);
  console.log(`   ✅ Landing page saved: ${outputPath}\n`);

  console.log('═'.repeat(60));
  console.log('\n💡 Next Steps:\n');
  console.log('   1. Deploy landing.html to Vercel/Netlify (FREE)');
  console.log('   2. Connect Google Forms for signups');
  console.log('   3. Share referral links on social media');
  console.log('   4. Launch weekly challenges\n');
  console.log('🌟 "Start small, free - build economy later!"\n');
}

// Auto-run demo
runMarketingDemo().catch(console.error);

// Export for use in other modules
export { AgentFactoryMarketing, type AgentTemplate, type MarketingUser };
