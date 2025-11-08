/**
 * Health-Aware Planner Agent
 * Part of the Health-Aware AIZ Team
 * 
 * Specializes in creating content strategies for healthcare professionals and patients
 * with a focus on evidence-based, compliant content.
 */

import { ZentixAgent } from '../../base/ZentixAgent';
import { AgentLogger, LogLevel } from '../../utils/agentLogger';

interface HealthcareTopic {
  id: string;
  title: string;
  category: 'medical_research' | 'patient_education' | 'healthcare_tech' | 'wellness';
  complexity: 'basic' | 'intermediate' | 'advanced';
  regulated: boolean; // Whether content requires special compliance considerations
}

interface ContentIdea {
  id: string;
  topic: string;
  format: 'article' | 'video' | 'infographic' | 'social_post';
  targetArchetype: 'healthcare_professional' | 'health_savvy_patient' | 'general_public';
  complianceNotes: string;
  priority: number; // 1-10
}

export class HealthAwarePlannerAgent extends ZentixAgent {
  private static instance: HealthAwarePlannerAgent;
  private topics: HealthcareTopic[];
  private contentIdeas: ContentIdea[];

  private constructor() {
    super({
      name: 'Health-Aware Planner Agent',
      description: 'Specializes in creating content strategies for healthcare professionals and patients with a focus on evidence-based, compliant content',
      capabilities: [
        'Healthcare topic research',
        'Content strategy development',
        'Regulatory compliance planning',
        'Evidence-based content planning',
        'Target audience analysis'
      ],
      version: '1.0.0'
    });

    // Initialize healthcare topics
    this.topics = [
      {
        id: 'ai-in-diagnosis',
        title: 'AI in Medical Diagnosis',
        category: 'healthcare_tech',
        complexity: 'advanced',
        regulated: true
      },
      {
        id: 'chronic-disease-management',
        title: 'Chronic Disease Management',
        category: 'patient_education',
        complexity: 'intermediate',
        regulated: false
      },
      {
        id: 'telemedicine-benefits',
        title: 'Benefits of Telemedicine',
        category: 'healthcare_tech',
        complexity: 'intermediate',
        regulated: false
      },
      {
        id: 'mental-health-awareness',
        title: 'Mental Health Awareness',
        category: 'wellness',
        complexity: 'basic',
        regulated: false
      }
    ];

    this.contentIdeas = [];
  }

  public static getInstance(): HealthAwarePlannerAgent {
    if (!HealthAwarePlannerAgent.instance) {
      HealthAwarePlannerAgent.instance = new HealthAwarePlannerAgent();
    }
    return HealthAwarePlannerAgent.instance;
  }

  /**
   * Research and identify content opportunities
   */
  async researchContentOpportunities(): Promise<ContentIdea[]> {
    return AgentLogger.measurePerformance(
      'HealthAwarePlannerAgent',
      'researchContentOpportunities',
      async () => {
        const ideas: ContentIdea[] = [];
        
        for (const topic of this.topics) {
          // Generate content ideas based on topic
          const idea: ContentIdea = {
            id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            topic: topic.title,
            format: this.determineOptimalFormat(topic),
            targetArchetype: this.determineTargetArchetype(topic),
            complianceNotes: this.generateComplianceNotes(topic),
            priority: this.calculatePriority(topic)
          };
          
          ideas.push(idea);
        }
        
        // Sort by priority
        ideas.sort((a, b) => b.priority - a.priority);
        
        this.contentIdeas = ideas;
        AgentLogger.log(LogLevel.INFO, 'HealthAwarePlannerAgent', `Generated ${ideas.length} content ideas`);
        
        return ideas;
      }
    );
  }

  /**
   * Determine optimal content format based on topic
   */
  private determineOptimalFormat(topic: HealthcareTopic): ContentIdea['format'] {
    switch (topic.category) {
      case 'medical_research':
        return 'article';
      case 'patient_education':
        return 'infographic';
      case 'healthcare_tech':
        return 'video';
      case 'wellness':
        return 'social_post';
      default:
        return 'article';
    }
  }

  /**
   * Determine target archetype based on topic
   */
  private determineTargetArchetype(topic: HealthcareTopic): ContentIdea['targetArchetype'] {
    switch (topic.complexity) {
      case 'basic':
        return 'general_public';
      case 'intermediate':
        return 'health_savvy_patient';
      case 'advanced':
        return 'healthcare_professional';
      default:
        return 'general_public';
    }
  }

  /**
   * Generate compliance notes for a topic
   */
  private generateComplianceNotes(topic: HealthcareTopic): string {
    if (!topic.regulated) {
      return 'No special compliance requirements';
    }
    
    return 'Content must include appropriate disclaimers and be reviewed by medical professionals before publication. Must comply with FDA and HIPAA guidelines.';
  }

  /**
   * Calculate priority for a topic
   */
  private calculatePriority(topic: HealthcareTopic): number {
    let priority = 5; // Base priority
    
    // Increase priority for trending topics
    if (topic.category === 'healthcare_tech') {
      priority += 2;
    }
    
    // Increase priority for patient education
    if (topic.category === 'patient_education') {
      priority += 1;
    }
    
    // Adjust for complexity
    if (topic.complexity === 'advanced') {
      priority += 1;
    }
    
    // Cap at 10
    return priority > 10 ? 10 : priority;
  }

  /**
   * Create content plan for a specific period
   */
  async createContentPlan(days: number = 30): Promise<any> {
    return AgentLogger.measurePerformance(
      'HealthAwarePlannerAgent',
      'createContentPlan',
      async () => {
        // Ensure we have content ideas
        if (this.contentIdeas.length === 0) {
          await this.researchContentOpportunities();
        }
        
        // Create a plan based on priority and format variety
        const plan: any = {
          period: `${days} days`,
          contentItems: [],
          complianceCheckpoints: []
        };
        
        // Distribute content ideas across the time period
        const itemsPerDay = Math.ceil(this.contentIdeas.length / days);
        let dayCounter = 1;
        
        for (let i = 0; i < this.contentIdeas.length; i++) {
          const idea = this.contentIdeas[i];
          const day = dayCounter++;
          
          plan.contentItems.push({
            day,
            idea,
            status: 'planned'
          });
          
          // Add compliance checkpoint for regulated content
          if (idea.complianceNotes !== 'No special compliance requirements') {
            plan.complianceCheckpoints.push({
              day: day + 2, // Review 2 days before publication
              contentId: idea.id,
              task: 'Medical professional review required'
            });
          }
          
          // Reset day counter if needed
          if (dayCounter > days) {
            dayCounter = 1;
          }
        }
        
        AgentLogger.log(LogLevel.INFO, 'HealthAwarePlannerAgent', `Created content plan for ${days} days with ${plan.contentItems.length} items`);
        return plan;
      }
    );
  }

  /**
   * Get current content ideas
   */
  getContentIdeas(): ContentIdea[] {
    return this.contentIdeas;
  }

  /**
   * Execute planning tasks as part of a workflow
   */
  async executeTask(task: any): Promise<any> {
    try {
      switch (task.type) {
        case 'RESEARCH_OPPORTUNITIES':
          return await this.researchContentOpportunities();
        case 'CREATE_CONTENT_PLAN':
          return await this.createContentPlan(task.days);
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'HealthAwarePlannerAgent', `Task execution failed: ${error.message}`);
      throw error;
    }
  }
}