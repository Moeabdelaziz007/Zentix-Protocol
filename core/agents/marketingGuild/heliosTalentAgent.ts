import { AgentLogger, LogLevel } from '../../utils/agentLogger';
import puppeteer, { Browser, Page } from 'puppeteer';
import { Wallet } from '../../economy/walletService';

/**
 * Helios Talent Hunter Agent
 * Part of the Marketing Guild
 * 
 * Specializes in automated talent scouting on the Mercor platform,
 * identifying, evaluating, and recommending top developer talent
 * based on specific criteria such as skills, experience, and market demand.
 */

interface TalentProfile {
  id: string;
  name: string;
  role: string;
  skills: string[];
  experience: string;
  location: string;
  timezone: string;
  profileUrl: string;
  fitScore?: number;
  aiSummary?: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'rejected';
}

interface JobRequirements {
  role: string;
  skills: string[];
  experience: string;
  timezone?: string;
  location?: string;
  additionalCriteria?: string[];
}

interface CandidateEvaluation {
  profile: TalentProfile;
  fitScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export class HeliosTalentAgent {
  private static instance: HeliosTalentAgent;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  private mercorUrl: string = 'https://work.mercor.com';
  
  private constructor() {
    // Initialize with default configuration
  }

  public static getInstance(): HeliosTalentAgent {
    if (!HeliosTalentAgent.instance) {
      HeliosTalentAgent.instance = new HeliosTalentAgent();
    }
    return HeliosTalentAgent.instance;
  }

  /**
   * Initialize the browser and navigate to Mercor
   */
  async initialize(): Promise<void> {
    return AgentLogger.measurePerformance(
      'HeliosTalentAgent',
      'initialize',
      async () => {
        try {
          // Launch browser in headless mode for production, non-headless for debugging
          this.browser = await puppeteer.launch({
            headless: true, // Set to false for debugging
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
          
          this.page = await this.browser.newPage();
          
          // Set viewport for consistent rendering
          await this.page.setViewport({ width: 1920, height: 1080 });
          
          // Navigate to Mercor
          await this.page.goto(this.mercorUrl, { waitUntil: 'networkidle2' });
          
          AgentLogger.log(LogLevel.INFO, 'HeliosTalentAgent', 'Browser initialized and navigated to Mercor');
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'HeliosTalentAgent', 'Failed to initialize browser', {}, error as Error);
          throw error;
        }
      }
    );
  }

  /**
   * Login to Mercor using provided credentials
   * 
   * @param email - Mercor account email
   * @param password - Mercor account password
   */
  async login(email: string, password: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'HeliosTalentAgent',
      'login',
      async () => {
        try {
          if (!this.page) {
            throw new Error('Browser not initialized');
          }
          
          // Wait for login elements to load
          await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
          
          // Fill in credentials
          await this.page.type('input[type="email"]', email);
          await this.page.type('input[type="password"]', password);
          
          // Submit login form
          await this.page.click('button[type="submit"]');
          
          // Wait for navigation or dashboard to load
          await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
          
          // Check if login was successful by looking for dashboard elements
          const dashboardElements = await this.page.$$('div[data-testid="dashboard"]');
          this.isLoggedIn = dashboardElements.length > 0;
          
          if (this.isLoggedIn) {
            AgentLogger.log(LogLevel.SUCCESS, 'HeliosTalentAgent', 'Successfully logged into Mercor');
          } else {
            AgentLogger.log(LogLevel.WARN, 'HeliosTalentAgent', 'Login may have failed - dashboard not detected');
          }
          
          return this.isLoggedIn;
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'HeliosTalentAgent', 'Login failed', {}, error as Error);
          this.isLoggedIn = false;
          return false;
        }
      }
    );
  }

  /**
   * Define job requirements and enhance them with AI
   * 
   * @param requirements - Basic job requirements
   * @returns Enhanced job requirements with related skills
   */
  async defineJobRequirements(requirements: JobRequirements): Promise<JobRequirements> {
    return AgentLogger.measurePerformance(
      'HeliosTalentAgent',
      'defineJobRequirements',
      async () => {
        try {
          // In a real implementation, this would use an LLM to enhance the requirements
          // For now, we'll simulate this enhancement
          
          AgentLogger.log(LogLevel.INFO, 'HeliosTalentAgent', 'Defining job requirements', { role: requirements.role });
          
          // Simulate AI enhancement by adding related skills
          const enhancedSkills = [...requirements.skills];
          
          // This is where we would call an LLM to expand the skills list
          // For example, if "React.js" is listed, we might add "Next.js", "Redux", etc.
          
          const enhancedRequirements: JobRequirements = {
            ...requirements,
            skills: enhancedSkills
          };
          
          AgentLogger.log(LogLevel.SUCCESS, 'HeliosTalentAgent', 'Job requirements defined and enhanced');
          
          return enhancedRequirements;
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'HeliosTalentAgent', 'Failed to define job requirements', {}, error as Error);
          throw error;
        }
      }
    );
  }

  /**
   * Search for talent based on job requirements
   * 
   * @param requirements - Enhanced job requirements
   * @returns Array of talent profiles
   */
  async searchTalent(requirements: JobRequirements): Promise<TalentProfile[]> {
    return AgentLogger.measurePerformance(
      'HeliosTalentAgent',
      'searchTalent',
      async () => {
        try {
          if (!this.page || !this.isLoggedIn) {
            throw new Error('Not logged in to Mercor');
          }
          
          AgentLogger.log(LogLevel.INFO, 'HeliosTalentAgent', 'Searching for talent', { 
            role: requirements.role, 
            skillCount: requirements.skills.length 
          });
          
          // Navigate to talent search page
          // This would depend on the actual Mercor UI structure
          await this.page.goto(`${this.mercorUrl}/search`, { waitUntil: 'networkidle2' });
          
          // Fill in search criteria
          // This is a simplified example - actual implementation would depend on Mercor's UI
          for (const skill of requirements.skills) {
            await this.page.type('input[data-testid="skill-search"]', skill);
            await this.page.keyboard.press('Enter');
          }
          
          // Apply role filter
          if (requirements.role) {
            await this.page.type('input[data-testid="role-search"]', requirements.role);
          }
          
          // Apply experience filter
          if (requirements.experience) {
            // This would depend on how experience is filtered on Mercor
          }
          
          // Submit search
          await this.page.click('button[data-testid="search-submit"]');
          await this.page.waitForSelector('div[data-testid="search-results"]', { timeout: 10000 });
          
          // Extract talent profiles from the first page of results
          const profiles: TalentProfile[] = [];
          
          // This is a simplified extraction - actual implementation would depend on Mercor's UI
          const profileElements = await this.page.$$('div[data-testid="talent-profile"]');
          
          for (const element of profileElements) {
            try {
              const name = await element.$eval('h3[data-testid="profile-name"]', el => el.textContent?.trim() || '');
              const role = await element.$eval('p[data-testid="profile-role"]', el => el.textContent?.trim() || '');
              const location = await element.$eval('span[data-testid="profile-location"]', el => el.textContent?.trim() || '');
              const experience = await element.$eval('span[data-testid="profile-experience"]', el => el.textContent?.trim() || '');
              
              // Extract skills - this would be more complex in reality
              const skills: string[] = [];
              const skillElements = await element.$$('span[data-testid="profile-skill"]');
              for (const skillEl of skillElements) {
                const skill = await skillEl.evaluate(el => el.textContent?.trim() || '');
                if (skill) skills.push(skill);
              }
              
              // Get profile URL
              const profileUrl = await element.$eval('a[data-testid="profile-link"]', el => el.getAttribute('href') || '');
              
              profiles.push({
                id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                role,
                skills,
                experience,
                location,
                timezone: '', // Would need to extract or infer this
                profileUrl: profileUrl.startsWith('http') ? profileUrl : `${this.mercorUrl}${profileUrl}`,
                status: 'pending'
              });
            } catch (profileError) {
              AgentLogger.log(LogLevel.WARN, 'HeliosTalentAgent', 'Failed to extract profile data', {}, profileError as Error);
              continue;
            }
          }
          
          AgentLogger.log(LogLevel.SUCCESS, 'HeliosTalentAgent', 'Talent search completed', { profileCount: profiles.length });
          
          return profiles;
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'HeliosTalentAgent', 'Talent search failed', {}, error as Error);
          throw error;
        }
      }
    );
  }

  /**
   * Evaluate candidates using AI
   * 
   * @param profiles - Array of talent profiles
   * @param requirements - Job requirements for evaluation
   * @returns Array of evaluated candidates
   */
  async evaluateCandidates(profiles: TalentProfile[], requirements: JobRequirements): Promise<CandidateEvaluation[]> {
    return AgentLogger.measurePerformance(
      'HeliosTalentAgent',
      'evaluateCandidates',
      async () => {
        try {
          AgentLogger.log(LogLevel.INFO, 'HeliosTalentAgent', 'Evaluating candidates', { profileCount: profiles.length });
          
          const evaluations: CandidateEvaluation[] = [];
          
          // In a real implementation, this would call an LLM for each profile
          // For now, we'll simulate the evaluation
          for (const profile of profiles) {
            // Simulate visiting the full profile page to get more detailed information
            if (this.page && this.isLoggedIn) {
              try {
                await this.page.goto(profile.profileUrl, { waitUntil: 'networkidle2' });
                
                // Extract additional information from the full profile
                // This would depend on Mercor's actual profile page structure
                const projectElements = await this.page.$$('div[data-testid="project-item"]');
                const projects: string[] = [];
                
                for (const projectEl of projectElements) {
                  const title = await projectEl.$eval('h4', el => el.textContent?.trim() || '');
                  projects.push(title);
                }
                
                // Add project information to the profile for better evaluation
                profile.skills = [...profile.skills, ...projects];
              } catch (profileError) {
                AgentLogger.log(LogLevel.WARN, 'HeliosTalentAgent', 'Failed to visit full profile', { profileUrl: profile.profileUrl }, profileError as Error);
              }
            }
            
            // Simulate AI evaluation
            // In a real implementation, this would call an LLM with the profile data and job requirements
            const fitScore = this.calculateFitScore(profile, requirements);
            const summary = this.generateEvaluationSummary(profile, requirements, fitScore);
            const strengths = this.identifyStrengths(profile, requirements);
            const weaknesses = this.identifyWeaknesses(profile, requirements);
            
            evaluations.push({
              profile,
              fitScore,
              summary,
              strengths,
              weaknesses
            });
          }
          
          // Sort candidates by fit score (highest first)
          evaluations.sort((a, b) => b.fitScore - a.fitScore);
          
          AgentLogger.log(LogLevel.SUCCESS, 'HeliosTalentAgent', 'Candidate evaluation completed', { evaluatedCount: evaluations.length });
          
          return evaluations;
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'HeliosTalentAgent', 'Candidate evaluation failed', {}, error as Error);
          throw error;
        }
      }
    );
  }

  /**
   * Calculate fit score for a candidate (simplified simulation)
   * 
   * @param profile - Candidate profile
   * @param requirements - Job requirements
   * @returns Fit score between 0 and 10
   */
  private calculateFitScore(profile: TalentProfile, requirements: JobRequirements): number {
    let score = 0;
    const maxScore = 10;
    
    // Role match (30% of score)
    if (profile.role.toLowerCase().includes(requirements.role.toLowerCase())) {
      score += 3;
    }
    
    // Skills match (50% of score)
    const requiredSkills = requirements.skills;
    const profileSkills = profile.skills.map(s => s.toLowerCase());
    const matchedSkills = requiredSkills.filter(skill => 
      profileSkills.some(profileSkill => profileSkill.includes(skill.toLowerCase()))
    );
    
    const skillMatchRatio = matchedSkills.length / requiredSkills.length;
    score += 5 * skillMatchRatio;
    
    // Experience match (20% of score)
    const profileExp = parseInt(profile.experience) || 0;
    const requiredExp = parseInt(requirements.experience) || 0;
    
    if (profileExp >= requiredExp) {
      score += 2;
    } else if (profileExp >= requiredExp * 0.7) {
      score += 1;
    }
    
    // Ensure score is within bounds
    return Math.min(Math.max(score, 0), maxScore);
  }

  /**
   * Generate evaluation summary (simplified simulation)
   * 
   * @param profile - Candidate profile
   * @param requirements - Job requirements
   * @param fitScore - Calculated fit score
   * @returns Evaluation summary
   */
  private generateEvaluationSummary(profile: TalentProfile, requirements: JobRequirements, fitScore: number): string {
    if (fitScore >= 8) {
      return `Excellent fit. ${profile.experience} of experience with key skills including ${requirements.skills.slice(0, 3).join(', ')}.`;
    } else if (fitScore >= 6) {
      return `Good fit. ${profile.experience} of experience with some key skills. May need mentoring in certain areas.`;
    } else if (fitScore >= 4) {
      return `Fair fit. Limited experience but shows potential. Would require significant onboarding.`;
    } else {
      return `Poor fit. Lacks required experience and key skills for this role.`;
    }
  }

  /**
   * Identify candidate strengths (simplified simulation)
   * 
   * @param profile - Candidate profile
   * @param requirements - Job requirements
   * @returns Array of strengths
   */
  private identifyStrengths(profile: TalentProfile, requirements: JobRequirements): string[] {
    const strengths: string[] = [];
    
    // Experience strength
    const profileExp = parseInt(profile.experience) || 0;
    const requiredExp = parseInt(requirements.experience) || 0;
    
    if (profileExp > requiredExp) {
      strengths.push(`Extensive experience (${profile.experience})`);
    }
    
    // Skills strength
    const requiredSkills = requirements.skills;
    const profileSkills = profile.skills.map(s => s.toLowerCase());
    const matchedSkills = requiredSkills.filter(skill => 
      profileSkills.some(profileSkill => profileSkill.includes(skill.toLowerCase()))
    );
    
    if (matchedSkills.length > requiredSkills.length * 0.7) {
      strengths.push('Strong skill set match');
    } else if (matchedSkills.length > 0) {
      strengths.push(`Key skills: ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    
    return strengths;
  }

  /**
   * Identify candidate weaknesses (simplified simulation)
   * 
   * @param profile - Candidate profile
   * @param requirements - Job requirements
   * @returns Array of weaknesses
   */
  private identifyWeaknesses(profile: TalentProfile, requirements: JobRequirements): string[] {
    const weaknesses: string[] = [];
    
    // Experience gap
    const profileExp = parseInt(profile.experience) || 0;
    const requiredExp = parseInt(requirements.experience) || 0;
    
    if (profileExp < requiredExp) {
      weaknesses.push(`Experience gap: requires ${requiredExp}+ years, candidate has ${profileExp}`);
    }
    
    // Skills gap
    const requiredSkills = requirements.skills;
    const profileSkills = profile.skills.map(s => s.toLowerCase());
    const missingSkills = requiredSkills.filter(skill => 
      !profileSkills.some(profileSkill => profileSkill.includes(skill.toLowerCase()))
    );
    
    if (missingSkills.length > requiredSkills.length * 0.3) {
      weaknesses.push(`Missing key skills: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    
    return weaknesses;
  }

  /**
   * Generate talent report
   * 
   * @param evaluations - Array of candidate evaluations
   * @returns Formatted talent report
   */
  async generateTalentReport(evaluations: CandidateEvaluation[]): Promise<string> {
    return AgentLogger.measurePerformance(
      'HeliosTalentAgent',
      'generateTalentReport',
      async () => {
        try {
          AgentLogger.log(LogLevel.INFO, 'HeliosTalentAgent', 'Generating talent report', { candidateCount: evaluations.length });
          
          // Convert evaluations to a formatted report
          let report = `# Helios Talent Report\n\n`;
          report += `Generated: ${new Date().toISOString()}\n`;
          report += `Total Candidates: ${evaluations.length}\n\n`;
          
          report += `## Top Candidates\n\n`;
          
          // Top 10 candidates
          const topCandidates = evaluations.slice(0, 10);
          
          for (const [index, evaluation] of topCandidates.entries()) {
            const profile = evaluation.profile;
            report += `### ${index + 1}. ${profile.name}\n`;
            report += `- **Role**: ${profile.role}\n`;
            report += `- **Experience**: ${profile.experience}\n`;
            report += `- **Location**: ${profile.location}\n`;
            report += `- **Fit Score**: ${evaluation.fitScore.toFixed(1)}/10\n`;
            report += `- **Profile**: [View Profile](${profile.profileUrl})\n`;
            report += `- **Summary**: ${evaluation.summary}\n`;
            report += `- **Strengths**: ${evaluation.strengths.join(', ') || 'None identified'}\n`;
            report += `- **Weaknesses**: ${evaluation.weaknesses.join(', ') || 'None identified'}\n\n`;
          }
          
          AgentLogger.log(LogLevel.SUCCESS, 'HeliosTalentAgent', 'Talent report generated');
          
          return report;
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'HeliosTalentAgent', 'Failed to generate talent report', {}, error as Error);
          throw error;
        }
      }
    );
  }

  /**
   * Close the browser and cleanup resources
   */
  async close(): Promise<void> {
    return AgentLogger.measurePerformance(
      'HeliosTalentAgent',
      'close',
      async () => {
        try {
          if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.isLoggedIn = false;
            AgentLogger.log(LogLevel.INFO, 'HeliosTalentAgent', 'Browser closed and resources cleaned up');
          }
        } catch (error) {
          AgentLogger.log(LogLevel.WARN, 'HeliosTalentAgent', 'Error during cleanup', {}, error as Error);
        }
      }
    );
  }
}