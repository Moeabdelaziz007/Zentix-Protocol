/**
 * Dynamic NFT System - Living Assets with On-Chain Game Theory
 * NFTs that evolve based on on-chain interactions and game theory
 * 
 * @module dynamicNFT
 * @version 1.0.0
 */

/**
 * NFT Faction types
 */
export type Faction = 'Sun' | 'Moon' | 'Star' | 'Earth';

/**
 * Dynamic NFT attributes
 */
export interface DynamicNFTAttributes {
  energy: number; // 0-100
  resources: number; // 0-1000
  allegiance: Faction;
  level: number;
  experience: number;
  specialAttributes: Map<string, number>;
  lastInteraction: string;
  birthTimestamp: string;
}

/**
 * Dynamic NFT metadata
 */
export interface DynamicNFT {
  tokenId: string;
  owner: string;
  name: string;
  attributes: DynamicNFTAttributes;
  imageData: string; // SVG or base64
  history: NFTEvent[];
  status: 'alive' | 'dormant' | 'evolved';
}

/**
 * NFT Event history
 */
export interface NFTEvent {
  type: 'mint' | 'cooperation' | 'competition' | 'evolution' | 'energy_change' | 'resource_change';
  timestamp: string;
  description: string;
  participants?: string[];
  outcome?: Record<string, any>;
}

/**
 * Cooperation action
 */
export interface CooperationAction {
  nft1: string;
  nft2: string;
  action: 'liquidity_provision' | 'staking' | 'governance_vote';
  protocol: string;
  reward: number;
}

/**
 * Competition bid
 */
export interface CompetitionBid {
  nftId: string;
  bidder: string;
  resourcesBid: number;
  targetAttribute: string;
  timestamp: string;
}

/**
 * Weekly competition
 */
export interface WeeklyCompetition {
  id: string;
  week: number;
  targetAttribute: string;
  attributeValue: number;
  bids: CompetitionBid[];
  startTime: string;
  endTime: string;
  status: 'active' | 'completed';
  winner?: string;
}

/**
 * Dynamic NFT System
 */
export class DynamicNFTSystem {
  private static nfts: Map<string, DynamicNFT> = new Map();
  private static competitions: Map<string, WeeklyCompetition> = new Map();
  private static currentWeek = 1;

  /**
   * Initialize the Dynamic NFT system
   */
  static initialize(): void {
    console.log(`✅ Dynamic NFT System initialized`);
    console.log(`   Current Week: ${this.currentWeek}`);
  }

  /**
   * Mint a new Dynamic NFT
   */
  static mintNFT(
    owner: string,
    name: string,
    faction: Faction
  ): DynamicNFT {
    const tokenId = `nft_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const nft: DynamicNFT = {
      tokenId,
      owner,
      name,
      attributes: {
        energy: 50,
        resources: 100,
        allegiance: faction,
        level: 1,
        experience: 0,
        specialAttributes: new Map(),
        lastInteraction: new Date().toISOString(),
        birthTimestamp: new Date().toISOString(),
      },
      imageData: this.generateSVGImage(faction, 50, 1),
      history: [
        {
          type: 'mint',
          timestamp: new Date().toISOString(),
          description: `${name} was born into the ${faction} faction`,
        },
      ],
      status: 'alive',
    };

    this.nfts.set(tokenId, nft);

    console.log(`🎨 Minted NFT: ${name} (${faction} faction)`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Energy: ${nft.attributes.energy}`);
    console.log(`   Resources: ${nft.attributes.resources}`);

    return nft;
  }

  /**
   * Execute cooperation between two NFTs
   */
  static async executeCooperation(action: CooperationAction): Promise<{
    success: boolean;
    reward: number;
    error?: string;
  }> {
    const nft1 = this.nfts.get(action.nft1);
    const nft2 = this.nfts.get(action.nft2);

    if (!nft1 || !nft2) {
      return { success: false, reward: 0, error: 'NFT not found' };
    }

    // Check if same faction
    if (nft1.attributes.allegiance !== nft2.attributes.allegiance) {
      return {
        success: false,
        reward: 0,
        error: 'NFTs must be from the same faction to cooperate',
      };
    }

    // Apply cooperation rewards
    const reward = action.reward;
    nft1.attributes.resources += reward;
    nft2.attributes.resources += reward;
    nft1.attributes.experience += 10;
    nft2.attributes.experience += 10;

    // Update images
    nft1.imageData = this.generateSVGImage(
      nft1.attributes.allegiance,
      nft1.attributes.energy,
      nft1.attributes.level
    );
    nft2.imageData = this.generateSVGImage(
      nft2.attributes.allegiance,
      nft2.attributes.energy,
      nft2.attributes.level
    );

    // Record event
    const event: NFTEvent = {
      type: 'cooperation',
      timestamp: new Date().toISOString(),
      description: `Cooperated on ${action.action} at ${action.protocol}`,
      participants: [action.nft1, action.nft2],
      outcome: { resourcesGained: reward },
    };

    nft1.history.push(event);
    nft2.history.push(event);

    console.log(`🤝 Cooperation successful!`);
    console.log(`   ${nft1.name} + ${nft2.name}`);
    console.log(`   Each gained: ${reward} resources`);

    // Check for level up
    this.checkLevelUp(nft1);
    this.checkLevelUp(nft2);

    return { success: true, reward: reward * 2 };
  }

  /**
   * Start a weekly competition
   */
  static startWeeklyCompetition(
    targetAttribute: string,
    attributeValue: number
  ): WeeklyCompetition {
    const competitionId = `comp_week_${this.currentWeek}`;

    const competition: WeeklyCompetition = {
      id: competitionId,
      week: this.currentWeek,
      targetAttribute,
      attributeValue,
      bids: [],
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    };

    this.competitions.set(competitionId, competition);

    console.log(`🏆 Weekly Competition Started!`);
    console.log(`   Week: ${this.currentWeek}`);
    console.log(`   Prize: ${targetAttribute} +${attributeValue}`);
    console.log(`   Ends: ${new Date(competition.endTime).toLocaleDateString()}`);

    return competition;
  }

  /**
   * Place a bid in the weekly competition
   */
  static placeBid(
    nftId: string,
    resourcesBid: number
  ): { success: boolean; error?: string } {
    const nft = this.nfts.get(nftId);
    if (!nft) {
      return { success: false, error: 'NFT not found' };
    }

    const activeCompetition = Array.from(this.competitions.values()).find(
      (c) => c.status === 'active'
    );

    if (!activeCompetition) {
      return { success: false, error: 'No active competition' };
    }

    if (nft.attributes.resources < resourcesBid) {
      return { success: false, error: 'Insufficient resources' };
    }

    // Deduct resources
    nft.attributes.resources -= resourcesBid;

    // Record bid
    const bid: CompetitionBid = {
      nftId,
      bidder: nft.owner,
      resourcesBid,
      targetAttribute: activeCompetition.targetAttribute,
      timestamp: new Date().toISOString(),
    };

    activeCompetition.bids.push(bid);

    console.log(`💰 Bid placed: ${nft.name}`);
    console.log(`   Resources bid: ${resourcesBid}`);
    console.log(`   Remaining resources: ${nft.attributes.resources}`);

    return { success: true };
  }

  /**
   * End weekly competition and declare winner
   */
  static endWeeklyCompetition(): {
    winner?: DynamicNFT;
    totalBids: number;
    resourcesBurned: number;
  } {
    const activeCompetition = Array.from(this.competitions.values()).find(
      (c) => c.status === 'active'
    );

    if (!activeCompetition) {
      return { totalBids: 0, resourcesBurned: 0 };
    }

    // Find highest bidder
    const sortedBids = activeCompetition.bids.sort((a, b) => b.resourcesBid - a.resourcesBid);

    if (sortedBids.length === 0) {
      activeCompetition.status = 'completed';
      return { totalBids: 0, resourcesBurned: 0 };
    }

    const winningBid = sortedBids[0];
    const winner = this.nfts.get(winningBid.nftId)!;

    // Award the special attribute
    winner.attributes.specialAttributes.set(
      activeCompetition.targetAttribute,
      activeCompetition.attributeValue
    );

    // Update winner
    activeCompetition.winner = winningBid.nftId;
    activeCompetition.status = 'completed';

    // Record event
    winner.history.push({
      type: 'competition',
      timestamp: new Date().toISOString(),
      description: `Won Week ${activeCompetition.week} competition`,
      outcome: {
        attribute: activeCompetition.targetAttribute,
        value: activeCompetition.attributeValue,
      },
    });

    const totalBids = activeCompetition.bids.length;
    const resourcesBurned = activeCompetition.bids.reduce((sum, b) => sum + b.resourcesBid, 0);

    console.log(`🏆 Competition Ended!`);
    console.log(`   Winner: ${winner.name}`);
    console.log(`   Total Bids: ${totalBids}`);
    console.log(`   Resources Burned: ${resourcesBurned}`);

    this.currentWeek++;

    return { winner, totalBids, resourcesBurned };
  }

  /**
   * Update energy based on time of day (oracle trigger)
   */
  static updateEnergyByTimeOfDay(timezone: string): void {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;

    console.log(`☀️ Time-based energy update (${isDaytime ? 'Day' : 'Night'})`);

    for (const nft of this.nfts.values()) {
      if (nft.attributes.allegiance === 'Sun' && isDaytime) {
        const energyBoost = 10;
        nft.attributes.energy = Math.min(100, nft.attributes.energy + energyBoost);

        nft.history.push({
          type: 'energy_change',
          timestamp: new Date().toISOString(),
          description: `Sun faction energy boost during daytime (+${energyBoost})`,
        });

        // Update image
        nft.imageData = this.generateSVGImage(
          nft.attributes.allegiance,
          nft.attributes.energy,
          nft.attributes.level
        );

        console.log(`   ${nft.name}: Energy +${energyBoost} → ${nft.attributes.energy}`);
      } else if (nft.attributes.allegiance === 'Moon' && !isDaytime) {
        const energyBoost = 10;
        nft.attributes.energy = Math.min(100, nft.attributes.energy + energyBoost);

        nft.history.push({
          type: 'energy_change',
          timestamp: new Date().toISOString(),
          description: `Moon faction energy boost during nighttime (+${energyBoost})`,
        });

        nft.imageData = this.generateSVGImage(
          nft.attributes.allegiance,
          nft.attributes.energy,
          nft.attributes.level
        );

        console.log(`   ${nft.name}: Energy +${energyBoost} → ${nft.attributes.energy}`);
      }
    }
  }

  /**
   * Get NFT by token ID
   */
  static getNFT(tokenId: string): DynamicNFT | undefined {
    return this.nfts.get(tokenId);
  }

  /**
   * Get all NFTs by owner
   */
  static getNFTsByOwner(owner: string): DynamicNFT[] {
    return Array.from(this.nfts.values()).filter((nft) => nft.owner === owner);
  }

  /**
   * Get NFTs by faction
   */
  static getNFTsByFaction(faction: Faction): DynamicNFT[] {
    return Array.from(this.nfts.values()).filter(
      (nft) => nft.attributes.allegiance === faction
    );
  }

  /**
   * Get active competition
   */
  static getActiveCompetition(): WeeklyCompetition | undefined {
    return Array.from(this.competitions.values()).find((c) => c.status === 'active');
  }

  /**
   * Get leaderboard by resources
   */
  static getLeaderboard(limit = 10): DynamicNFT[] {
    return Array.from(this.nfts.values())
      .sort((a, b) => b.attributes.resources - a.attributes.resources)
      .slice(0, limit);
  }

  /**
   * Check and apply level up
   * 
   * @private
   */
  private static checkLevelUp(nft: DynamicNFT): void {
    const expNeeded = nft.attributes.level * 100;

    if (nft.attributes.experience >= expNeeded) {
      nft.attributes.level++;
      nft.attributes.experience -= expNeeded;
      nft.attributes.energy = Math.min(100, nft.attributes.energy + 20);

      nft.history.push({
        type: 'evolution',
        timestamp: new Date().toISOString(),
        description: `Evolved to Level ${nft.attributes.level}`,
      });

      // Update image
      nft.imageData = this.generateSVGImage(
        nft.attributes.allegiance,
        nft.attributes.energy,
        nft.attributes.level
      );

      console.log(`⬆️  ${nft.name} leveled up to Level ${nft.attributes.level}!`);
    }
  }

  /**
   * Generate SVG image based on attributes
   * 
   * @private
   */
  private static generateSVGImage(faction: Faction, energy: number, level: number): string {
    const colors: Record<Faction, { primary: string; secondary: string }> = {
      Sun: { primary: '#FFD700', secondary: '#FFA500' },
      Moon: { primary: '#C0C0C0', secondary: '#4169E1' },
      Star: { primary: '#FFFFFF', secondary: '#9370DB' },
      Earth: { primary: '#8B4513', secondary: '#228B22' },
    };

    const color = colors[faction];
    const glow = energy > 70 ? 'url(#glow)' : 'none';
    const size = 50 + level * 10;

    return `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow">
      <stop offset="0%" style="stop-color:${color.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color.secondary};stop-opacity:0" />
    </radialGradient>
  </defs>
  <rect width="300" height="300" fill="#1a1a2e"/>
  <circle cx="150" cy="150" r="${size}" fill="${color.primary}" filter="${glow}"/>
  <text x="150" y="250" font-family="Arial" font-size="20" fill="white" text-anchor="middle">
    ${faction} • Lv${level} • E:${energy}
  </text>
</svg>`;
  }
}

// Initialize on module load
DynamicNFTSystem.initialize();