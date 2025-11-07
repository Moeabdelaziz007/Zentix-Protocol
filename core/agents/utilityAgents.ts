import { randomBytes } from 'crypto';
import type { Lead, AnalyticsEvent } from '../types';

/**
 * Zentix Utility Agents - Content Generation & Marketing
 * Landing pages, social media, email funnels for growth
 * 
 * @module utilityAgents
 * @version 1.0.0
 */

/**
 * Landing page template
 */
export interface LandingPageTemplate {
  id: string;
  title: string;
  headline: string;
  subheadline: string;
  cta_text: string;
  cta_link: string;
  features: string[];
  testimonials?: Array<{ name: string; text: string }>;
  style: 'minimal' | 'modern' | 'vibrant' | 'professional';
  html: string;
}

/**
 * Social media post
 */
export interface SocialPost {
  id: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content: string;
  hashtags: string[];
  media_url?: string;
  scheduled_time?: string;
  engagement_estimate: number;
}

/**
 * Email sequence
 */
export interface EmailSequence {
  id: string;
  name: string;
  emails: Array<{
    subject: string;
    body: string;
    delay_days: number;
  }>;
  target_audience: string;
  conversion_goal: string;
}

/**
 * LandingPageAgent - Generates high-converting landing pages
 */
export class LandingPageAgent {
  /**
   * Generate landing page for campaign
   * 
   * @param config - Page configuration
   * @returns Landing page template
   * 
   * @example
   * ```ts
   * const page = LandingPageAgent.generate({
   *   title: 'Join Zentix Network',
   *   headline: 'Earn Passive Income with AI Agents',
   *   features: ['Zero upfront cost', 'Automated rewards', 'Blockchain security']
   * });
   * ```
   */
  static generate(config: {
    title: string;
    headline: string;
    subheadline: string;
    features: string[];
    ctaText?: string;
    ctaLink?: string;
    style?: 'minimal' | 'modern' | 'vibrant' | 'professional';
  }): LandingPageTemplate {
    const {
      title,
      headline,
      subheadline,
      features,
      ctaText = 'Get Started Free',
      ctaLink = '/signup',
      style = 'modern',
    } = config;

    const html = this.generateHTML(title, headline, subheadline, features, ctaText, ctaLink, style);

    return {
      id: randomBytes(8).toString('hex'),
      title,
      headline,
      subheadline,
      cta_text: ctaText,
      cta_link: ctaLink,
      features,
      style,
      html,
    };
  }

  /**
   * Generate HTML for landing page
   */
  private static generateHTML(
    title: string,
    headline: string,
    subheadline: string,
    features: string[],
    ctaText: string,
    ctaLink: string,
    style: string
  ): string {
    const styleMap = {
      minimal: { bg: '#ffffff', primary: '#000000', accent: '#666666' },
      modern: { bg: '#f8f9fa', primary: '#2563eb', accent: '#1e40af' },
      vibrant: { bg: '#fef3c7', primary: '#f59e0b', accent: '#d97706' },
      professional: { bg: '#f1f5f9', primary: '#0f172a', accent: '#475569' },
    };

    const colors = styleMap[style as keyof typeof styleMap] || styleMap.modern;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${colors.bg};
      color: #333;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .hero { text-align: center; padding: 80px 20px; }
    .hero h1 { 
      font-size: 3rem; 
      font-weight: 800; 
      color: ${colors.primary};
      margin-bottom: 20px;
    }
    .hero p { 
      font-size: 1.5rem; 
      color: ${colors.accent};
      margin-bottom: 40px;
    }
    .cta-button {
      display: inline-block;
      background: ${colors.primary};
      color: white;
      padding: 16px 48px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.2rem;
      transition: transform 0.2s;
    }
    .cta-button:hover { transform: scale(1.05); }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      padding: 60px 20px;
    }
    .feature {
      text-align: center;
      padding: 30px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .feature h3 { color: ${colors.primary}; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>${headline}</h1>
      <p>${subheadline}</p>
      <a href="${ctaLink}" class="cta-button">${ctaText}</a>
    </div>
    <div class="features">
      ${features.map(f => `
        <div class="feature">
          <h3>✨</h3>
          <p>${f}</p>
        </div>
      `).join('')}
    </div>
  </div>
  <script>
    // Track page view
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        page: '${title}',
        timestamp: new Date().toISOString()
      })
    });
  </script>
</body>
</html>`;
  }

  /**
   * Generate referral landing page
   * 
   * @param referralCode - Referral code
   * @param referrerName - Name of referrer
   * @returns Landing page
   */
  static generateReferralPage(referralCode: string, referrerName?: string): LandingPageTemplate {
    return this.generate({
      title: `Join Zentix - Invited by ${referrerName || 'a friend'}`,
      headline: '🚀 Join the Future of AI-Powered Income',
      subheadline: `${referrerName || 'Your friend'} is earning passive rewards. You can too!`,
      features: [
        '💰 Earn ZXT tokens automatically',
        '🤖 AI agents work for you 24/7',
        '🔒 Blockchain-secured identity',
        '📈 Zero upfront investment needed',
      ],
      ctaText: `Join with code ${referralCode}`,
      ctaLink: `/signup?ref=${referralCode}`,
      style: 'vibrant',
    });
  }
}

/**
 * SocialMediaAgent - Creates engaging social content
 */
export class SocialMediaAgent {
  /**
   * Generate social media post
   * 
   * @param config - Post configuration
   * @returns Social post
   */
  static generatePost(config: {
    platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
    topic: string;
    tone?: 'professional' | 'casual' | 'excited' | 'informative';
    includeHashtags?: boolean;
  }): SocialPost {
    const { platform, topic, tone = 'excited', includeHashtags = true } = config;

    const content = this.generateContent(platform, topic, tone);
    const hashtags = includeHashtags ? this.generateHashtags(topic, platform) : [];
    const engagement = this.estimateEngagement(platform, content.length, hashtags.length);

    return {
      id: randomBytes(8).toString('hex'),
      platform,
      content,
      hashtags,
      engagement_estimate: engagement,
    };
  }

  /**
   * Generate content based on platform and topic
   */
  private static generateContent(
    platform: string,
    topic: string,
    tone: string
  ): string {
    const templates = {
      twitter: {
        excited: `🚀 Just discovered ${topic}! The future of AI-powered income is here. Earning passive rewards has never been easier. Who's ready to join the revolution? 💰`,
        professional: `Exploring ${topic} and its potential for autonomous value creation. The intersection of AI and blockchain is creating unprecedented opportunities.`,
        casual: `Yo! Check out ${topic} - it's pretty cool how you can earn rewards passively. No cap 🔥`,
        informative: `${topic} enables users to generate passive income through AI agents. Key features: automated rewards, blockchain security, zero upfront cost.`,
      },
      linkedin: {
        excited: `Excited to share my experience with ${topic}! As professionals, we're always looking for innovative ways to create value. The combination of AI agents and blockchain technology is opening new doors. #Innovation #AI #Blockchain`,
        professional: `${topic} represents a significant advancement in decentralized autonomous systems. By leveraging AI agents for value creation, users can participate in a new economic paradigm with minimal friction.`,
        casual: `Had to share this - ${topic} is changing the game for passive income. The tech is solid and the community is growing fast!`,
        informative: `Understanding ${topic}: A comprehensive look at AI-powered passive income generation. Learn how autonomous agents create value while maintaining blockchain security and user privacy.`,
      },
      facebook: {
        excited: `🎉 Friends! You need to check out ${topic}! I've been using it and the results are amazing. Passive income through AI agents - it's like having a digital assistant working for you 24/7! 💼✨`,
        professional: `Sharing an interesting discovery: ${topic}. For those interested in fintech and AI, this platform combines autonomous agents with blockchain for passive income generation.`,
        casual: `Hey everyone! Found this cool thing called ${topic}. You can earn rewards without much effort. Pretty neat! 😊`,
        informative: `Let me break down ${topic} for you: It's a platform that uses AI agents to help you earn passive income. No scams, no pyramid schemes - just smart technology working in your favor.`,
      },
      instagram: {
        excited: `✨ New discovery alert! ✨

${topic} is literally the future 🚀

Imagine earning while you sleep 💤💰
AI agents doing the work 🤖
Blockchain security 🔒

Who's in? Drop a 💎 below!`,
        professional: `${topic}: Where AI meets opportunity

📊 Smart automation
💼 Professional tools
🔐 Secure platform

Swipe to learn more ➡️`,
        casual: `Okay but seriously... ${topic} is kinda amazing?? 😍

Passive income ✅
Easy to use ✅
Actually works ✅

Link in bio! 🔗`,
        informative: `📚 WHAT IS ${topic}? 📚

A platform that uses AI to generate passive income

✅ Automated rewards
✅ Blockchain-backed
✅ Zero upfront cost

Comment "INFO" for details!`,
      },
    };

    return templates[platform as keyof typeof templates][tone as keyof typeof templates['twitter']] || templates.twitter.excited;
  }

  /**
   * Generate relevant hashtags
   */
  private static generateHashtags(topic: string, platform: string): string[] {
    const baseHashtags = ['AI', 'PassiveIncome', 'Blockchain', 'Web3', 'Crypto'];
    const platformSpecific = {
      twitter: ['CryptoTwitter', 'AIAgent', 'DeFi'],
      linkedin: ['Innovation', 'Technology', 'FinTech'],
      facebook: ['TechNews', 'MakeMoney', 'SideHustle'],
      instagram: ['TechLife', 'MoneyMoves', 'FutureOfWork'],
    };

    return [...baseHashtags, ...(platformSpecific[platform as keyof typeof platformSpecific] || [])].slice(0, 5);
  }

  /**
   * Estimate engagement potential
   */
  private static estimateEngagement(platform: string, contentLength: number, hashtagCount: number): number {
    const baseEngagement = { twitter: 50, linkedin: 30, facebook: 40, instagram: 60 };
    const base = baseEngagement[platform as keyof typeof baseEngagement] || 40;
    
    const lengthBonus = contentLength > 100 && contentLength < 280 ? 10 : 0;
    const hashtagBonus = hashtagCount >= 3 && hashtagCount <= 5 ? 15 : 0;
    
    return base + lengthBonus + hashtagBonus;
  }

  /**
   * Generate week's worth of content
   * 
   * @param topics - Topics to cover
   * @param platforms - Platforms to target
   * @returns Array of scheduled posts
   */
  static generateContentCalendar(
    topics: string[],
    platforms: Array<'twitter' | 'linkedin' | 'facebook' | 'instagram'>
  ): SocialPost[] {
    const posts: SocialPost[] = [];
    const tones: Array<'professional' | 'casual' | 'excited' | 'informative'> = ['excited', 'professional', 'casual', 'informative'];
    
    let dayOffset = 0;
    
    for (const topic of topics) {
      for (const platform of platforms) {
        const tone = tones[Math.floor(Math.random() * tones.length)];
        const post = this.generatePost({ platform, topic, tone });
        
        // Schedule posts throughout the week
        const scheduleDate = new Date();
        scheduleDate.setDate(scheduleDate.getDate() + dayOffset);
        scheduleDate.setHours(10, 0, 0, 0); // 10 AM
        
        post.scheduled_time = scheduleDate.toISOString();
        posts.push(post);
        
        dayOffset++;
        if (dayOffset > 7) dayOffset = 0;
      }
    }
    
    return posts;
  }
}

/**
 * EmailFunnelAgent - Creates conversion-optimized email sequences
 */
export class EmailFunnelAgent {
  /**
   * Generate email funnel for user onboarding
   * 
   * @param goal - Conversion goal
   * @returns Email sequence
   */
  static generateOnboardingFunnel(goal: 'signup' | 'first_investment' | 'referral' = 'signup'): EmailSequence {
    const funnels = {
      signup: {
        name: 'Welcome & Signup Sequence',
        emails: [
          {
            subject: '🎉 Welcome to Zentix - Your AI-Powered Income Journey Starts Here',
            body: this.formatEmail(
              'Welcome Aboard!',
              `We're thrilled to have you join Zentix Network. Here's what you can expect:

✅ Automated passive income through AI agents
✅ Blockchain-secured digital identity
✅ Zero upfront investment needed

Ready to get started? Click below to complete your profile and claim your welcome bonus of 50 ZXT tokens!`,
              'Complete My Profile',
              '/onboarding'
            ),
            delay_days: 0,
          },
          {
            subject: '💡 Quick Start Guide: Earn Your First Rewards',
            body: this.formatEmail(
              'Let\'s Get You Earning',
              `You're one step away from passive income! Here's your quick start guide:

1. Set up your first AI agent (2 minutes)
2. Share your referral code (earn 25 ZXT per friend)
3. Enable auto-invest for compound returns

Most users earn their first rewards within 24 hours. Let's make it happen!`,
              'Start Earning Now',
              '/dashboard'
            ),
            delay_days: 1,
          },
          {
            subject: '📈 Your Potential Earnings: Real Numbers from Real Users',
            body: this.formatEmail(
              'See What\'s Possible',
              `Our community is thriving! Here's what users like you are earning:\n\n• Average: 150 ZXT/month in passive rewards\n• Top referrers: 500+ ZXT/month\n• Micro-investors: 12% APY average\n\nYour journey is unique, but these numbers show what's possible. Ready to start yours?`,
              'View Dashboard',
              '/dashboard'
            ),
            delay_days: 3,
          },
        ],
        target_audience: 'New signups',
        conversion_goal: 'Complete profile setup',
      },
      first_investment: {
        name: 'Investment Activation Sequence',
        emails: [
          {
            subject: '💰 Your First Micro-Investment: Risk-Free Path to Growth',
            body: this.formatEmail(
              'Start Small, Think Big',
              `Ready to put your ZXT tokens to work? Our micro-investment feature lets you:

• Start with as little as 10 ZXT
• Auto-compound for maximum returns
• Withdraw anytime, no penalties

Average APY: 12% | Risk level: Low | Time: Set it and forget it`,
              'Start Investing',
              '/invest'
            ),
            delay_days: 0,
          },
          {
            subject: '🎯 Smart Strategies: How Top Investors Maximize Returns',
            body: this.formatEmail(
              'Learn from the Best',
              `Want to optimize your returns? Here's what successful investors do:\n\n1. Diversify across arbitrage + staking\n2. Reinvest rewards automatically\n3. Set profit targets and stick to them\n\nOur AI agents handle the complexity. You just set your preferences.`,
              'Optimize My Strategy',
              '/strategies'
            ),
            delay_days: 2,
          },
        ],
        target_audience: 'Active users without investments',
        conversion_goal: 'Create first micro-investment',
      },
      referral: {
        name: 'Referral Maximization Sequence',
        emails: [
          {
            subject: '🚀 Unlock Unlimited Earning: Your Personal Referral Code',
            body: this.formatEmail(
              'Share the Wealth',
              `Your unique referral code is ready! Here's how to maximize earnings:\n\n• Bronze tier: 10 ZXT (new signup)\n• Silver tier: 25 ZXT (first activity)\n• Gold tier: 50 ZXT ($10+ value)\n• Platinum tier: 100 ZXT (active contributor)\n\nPlus: Earn 20% of your referrals' rewards forever!`,
              'Get My Referral Code',
              '/referrals'
            ),
            delay_days: 0,
          },
          {
            subject: '📱 Pre-Made Templates: Share Zentix in Seconds',
            body: this.formatEmail(
              'Make Sharing Easy',
              `We've created ready-to-use content for:\n\n• Twitter/X posts\n• LinkedIn updates\n• Facebook shares\n• Instagram stories\n\nJust copy, paste, and watch your rewards grow. It's that simple!`,
              'Access Templates',
              '/share-templates'
            ),
            delay_days: 2,
          },
        ],
        target_audience: 'Users with potential for referrals',
        conversion_goal: 'Generate first referral',
      },
    };

    return {
      id: randomBytes(8).toString('hex'),
      ...funnels[goal],
    };
  }

  /**
   * Format email with template
   */
  private static formatEmail(title: string, body: string, ctaText: string, ctaLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .cta { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <p>${body.replace(/\n/g, '<br>')}</p>
      <center>
        <a href="${ctaLink}" class="cta">${ctaText}</a>
      </center>
    </div>
    <div class="footer">
      <p>Zentix Network - AI-Powered Passive Income</p>
      <p>You received this email because you signed up for Zentix.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate re-engagement campaign
   * 
   * @param daysSinceLastActivity - Days since user was last active
   * @returns Email sequence
   */
  static generateReEngagementCampaign(daysSinceLastActivity: number): EmailSequence {
    const urgency = daysSinceLastActivity > 30 ? 'high' : daysSinceLastActivity > 14 ? 'medium' : 'low';
    
    const campaigns = {
      high: {
        subject: '⚠️ Your Zentix Account: Don\'t Miss Out on These Rewards',
        body: `We noticed you haven't been active lately. Here's what you're missing:\n\n• ${daysSinceLastActivity * 2} ZXT in potential rewards\n• New arbitrage opportunities (avg 5% profit)\n• Limited-time 2x referral bonus\n\nYour account is still active. Come back and claim what's yours!`,
      },
      medium: {
        subject: '👋 We Miss You! Here\'s 25 ZXT to Welcome You Back',
        body: `It's been ${daysSinceLastActivity} days! We've added new features:

✨ Auto-investment with 12% APY
✨ Enhanced referral rewards
✨ New market intelligence tools

Claim your 25 ZXT welcome-back bonus today!`,
      },
      low: {
        subject: '📊 Your Weekly Zentix Update: New Opportunities Inside',
        body: `Quick update on what's happening:\n\n• 3 new arbitrage opportunities detected\n• Your portfolio performance: Up 8%\n• Friend joined using your code: +25 ZXT earned\n\nStay active to maximize your rewards!`,
      },
    };

    const campaign = campaigns[urgency];

    return {
      id: randomBytes(8).toString('hex'),
      name: 'Re-engagement Campaign',
      emails: [
        {
          subject: campaign.subject,
          body: this.formatEmail('We Miss You!', campaign.body, 'Return to Dashboard', '/dashboard'),
          delay_days: 0,
        },
      ],
      target_audience: `Inactive users (${daysSinceLastActivity} days)`,
      conversion_goal: 'Re-activate user',
    };
  }
}
