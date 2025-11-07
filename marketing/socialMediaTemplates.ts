/**
 * Social Media Marketing Templates
 * Ready-to-use posts for Twitter, LinkedIn, Instagram
 */

export interface SocialPost {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
  content: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt?: string;
}

/**
 * Generate social media posts
 */
export class SocialMediaMarketing {
  /**
   * Twitter/X Posts
   */
  static getTwitterPosts(): SocialPost[] {
    return [
      {
        platform: 'twitter',
        content: `🚀 Build AI agents in 60 seconds — for FREE!

✅ 1 TRILLION free AI tokens
✅ No credit card needed
✅ 6 ready-to-use templates
✅ Earn rewards for referrals

Start your AI empire today 👇`,
        hashtags: ['#AI', '#BuildWithManus', '#NoCode', '#Zentix', '#FreeAI'],
        callToAction: 'Link: zentix.app/free',
      },
      {
        platform: 'twitter',
        content: `💡 What if you could create:
• Content Writer AI
• Sales Email Agent
• Data Analyst Bot
• Customer Support AI

All for FREE with 1 trillion AI tokens?

That's exactly what we built 🔥`,
        hashtags: ['#AIAgent', '#Automation', '#FreeTech'],
        callToAction: 'Try it now: zentix.app',
      },
      {
        platform: 'twitter',
        content: `🎁 REFERRAL BONUS:

Invite a friend → Get 100 ZXT
They create an agent → Get 20 more points
Level up → Get 200 ZXT bonus

Building AI shouldn't cost money.
It should EARN you money 💰`,
        hashtags: ['#ReferralProgram', '#EarnCrypto', '#AI'],
        callToAction: 'Get your code: zentix.app/refer',
      },
    ];
  }

  /**
   * LinkedIn Posts (Professional)
   */
  static getLinkedInPosts(): SocialPost[] {
    return [
      {
        platform: 'linkedin',
        content: `🌟 The Future of Work: AI Agents as Team Members

I'm excited to share that we've launched Zentix Agent Factory - a platform where anyone can build production-ready AI agents in minutes, not months.

Here's what makes it different:

✅ 1 Trillion Free AI Tokens (powered by Manus)
✅ 6 Professional Templates (from content creation to data analysis)
✅ Blockchain-backed Identity System
✅ Self-sustaining Token Economy

Early adopters are already building:
• Marketing automation agents
• Customer support assistants
• Data analysis tools
• Sales email generators

The best part? It's completely free to start.

If you're a developer, entrepreneur, or tech enthusiast interested in AI automation, I'd love to hear your thoughts.

#AI #Automation #FutureOfWork #Innovation #BuildInPublic`,
        hashtags: [],
        callToAction: 'Learn more: zentix.app',
        imagePrompt: 'Professional dashboard showing AI agents working together',
      },
      {
        platform: 'linkedin',
        content: `🚀 Case Study: How We Built a Self-Sustaining AI Economy

Three weeks ago, we launched an experiment: What if AI agents could create, govern, and reward themselves?

The results:
📊 100+ agents created in first week
💰 10,000+ tokens distributed automatically
🤝 40% referral conversion rate
⚡ Zero infrastructure costs

Key learnings:
1. Free tiers + gamification = explosive growth
2. Token rewards > cash rewards for early adopters
3. Community governance works for AI systems
4. Manus free tokens made this possible

Open to discussions about tokenomics, AI governance, and building in public.

#AIEconomy #Web3 #Tokenomics #StartupGrowth`,
        hashtags: [],
        callToAction: 'Read full case study: zentix.app/blog',
      },
    ];
  }

  /**
   * Instagram Posts (Visual)
   */
  static getInstagramPosts(): SocialPost[] {
    return [
      {
        platform: 'instagram',
        content: `✨ Your AI Agent Empire Starts Here ✨

Swipe to see what you can build →

1️⃣ Content Writer AI
2️⃣ Sales Email Bot  
3️⃣ Data Analyst Pro
4️⃣ Support Agent
5️⃣ Resume Analyzer
6️⃣ Creative Designer

All FREE with 1 trillion AI tokens 🎁

Link in bio to start building 👆

#AIagents #NoCode #FreeTech #BuildYourEmpire #TechInnovation #AIautomation #ZentixProtocol`,
        hashtags: [],
        callToAction: 'Link in bio',
        imagePrompt: 'Carousel: 6 colorful cards showing each agent type with icons',
      },
      {
        platform: 'instagram',
        content: `💰 MAKE MONEY WHILE YOU BUILD 💰

1. Create your first AI agent (FREE)
2. Get 50 ZXT tokens instantly
3. Refer friends → Earn 100 ZXT each
4. Level up → Get 200 ZXT bonus

🎮 It's like a game, but your rewards are REAL

Ready to play? Link in bio 🚀

#CryptoRewards #AIbuilder #PassiveIncome #Web3 #EarnWhileYouLearn`,
        hashtags: [],
        callToAction: 'Start earning: Link in bio',
        imagePrompt: 'Gamified UI showing level progression and token rewards',
      },
    ];
  }

  /**
   * Generate weekly challenge post
   */
  static generateWeeklyChallenge(week: number): SocialPost {
    const challenges = [
      'Build a content writing agent that can write 3 different blog styles',
      'Create a sales agent that personalizes emails based on industry',
      'Design a data analyst that visualizes CSV files automatically',
      'Build a customer support agent with FAQ auto-responses',
      'Create an agent that analyzes resumes and suggests improvements',
      'Design a creative agent that generates marketing campaign ideas',
    ];

    const challenge = challenges[(week - 1) % challenges.length];

    return {
      platform: 'twitter',
      content: `🎯 WEEKLY CHALLENGE #${week}

${challenge}

🏆 Rewards:
• Complete it: 100 points
• Share results: 50 bonus points
• Best submission: 500 ZXT + Feature

Deadline: 7 days
Use #ZentixChallenge to share

Let's build! 🚀`,
      hashtags: ['#ZentixChallenge', '#AIChallenge', '#BuildInPublic'],
      callToAction: 'Join now: zentix.app/challenge',
    };
  }

  /**
   * Generate user success story post
   */
  static generateSuccessStory(userName: string, achievement: string): SocialPost {
    return {
      platform: 'linkedin',
      content: `🌟 Success Story: ${userName}

"${achievement}"

This is exactly why we built Zentix - to empower builders to create AI solutions without barriers.

${userName} joined us 2 weeks ago with zero AI experience. Today, they're running automated agents that save them 10+ hours/week.

If you're thinking "I wish I could automate X", stop wishing. Start building.

It's free. It's easy. It's powerful.

#SuccessStory #AIAutomation #BuilderCommunity #Innovation`,
      hashtags: [],
      callToAction: 'Start your journey: zentix.app',
    };
  }

  /**
   * Get all posts for a week
   */
  static getWeeklyContent(week: number): {
    monday: SocialPost;
    wednesday: SocialPost;
    friday: SocialPost;
    challenge: SocialPost;
  } {
    const twitter = this.getTwitterPosts();
    const linkedin = this.getLinkedInPosts();
    const instagram = this.getInstagramPosts();

    return {
      monday: twitter[0],
      wednesday: linkedin[0],
      friday: instagram[0],
      challenge: this.generateWeeklyChallenge(week),
    };
  }

  /**
   * Generate email templates
   */
  static getEmailTemplates(): {
    welcome: string;
    referral: string;
    levelUp: string;
  } {
    return {
      welcome: `
Subject: 🎉 Welcome to Zentix! Your 50 ZXT are waiting

Hi {{name}},

Welcome to the Zentix Agent Factory! 🚀

Your account is ready and we've credited you 50 ZXT tokens to get started.

Here's what you can do right now:

1. ✨ Choose from 6 AI agent templates
2. 🎨 Customize your first agent in 60 seconds
3. 🎁 Get your referral code and earn 100 ZXT per friend
4. 🏆 Join weekly challenges for bonus rewards

Your referral code: {{referralCode}}
Share it and earn: 100 ZXT per signup!

Ready to build your AI empire?

[Create Your First Agent →]

Questions? Just reply to this email.

Happy building!
The Zentix Team

P.S. First 100 builders get exclusive "Founder" badge 👑
      `,
      referral: `
Subject: 💰 You earned 100 ZXT! {{referredName}} just joined

Hey {{name}},

Great news! {{referredName}} just signed up using your referral code.

You've earned: 100 ZXT + 20 Points 🎉

Your stats:
• Total Referrals: {{totalReferrals}}
• Tokens Earned: {{tokensEarned}} ZXT
• Current Level: {{level}}

Keep sharing your code to level up faster:
{{referralLink}}

Next milestone: {{nextMilestone}}

Keep crushing it!
The Zentix Team
      `,
      levelUp: `
Subject: 🎊 LEVEL UP! You're now {{newLevel}}

Congratulations {{name}}!

You've reached {{newLevel}} level! 🏆

Rewards unlocked:
• 200 ZXT bonus tokens
• Priority support access
• {{levelBenefit}}

Your journey so far:
• Agents Created: {{agentsCreated}}
• Tokens Earned: {{tokensEarned}} ZXT
• Community Rank: Top {{percentile}}%

What's next?
[View Your Dashboard →]
[Create Another Agent →]
[Share Your Success →]

You're building something amazing!
The Zentix Team

P.S. Platinum members get early access to new features 👀
      `,
    };
  }

  /**
   * Export all content to JSON
   */
  static exportAllContent(): any {
    return {
      twitter: this.getTwitterPosts(),
      linkedin: this.getLinkedInPosts(),
      instagram: this.getInstagramPosts(),
      emails: this.getEmailTemplates(),
      challenges: Array.from({ length: 4 }, (_, i) =>
        this.generateWeeklyChallenge(i + 1)
      ),
    };
  }
}

// Export ready-to-use content
export const marketingContent = SocialMediaMarketing.exportAllContent();
