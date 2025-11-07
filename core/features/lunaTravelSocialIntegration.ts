/**
 * Luna Travel Social Integration
 * Google People API integration for sharing travel plans
 * 
 * @module lunaTravelSocialIntegration
 * @version 1.0.0
 */

import { GooglePeopleAPI } from '../apis/googlePeopleAPI';
import { AgentLogger } from '../utils/agentLogger';

/**
 * Luna Travel Social Integration
 * Enables sharing travel plans with Google Contacts
 */
export class LunaTravelSocialIntegration {
  /**
   * Get user's Google contacts for travel plan sharing
   * @param userId - ZentixOS user ID
   * @param searchQuery - Optional search query to filter contacts
   */
  static async getTravelBuddies(
    userId: string,
    searchQuery?: string
  ): Promise<Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    isTravelBuddy: boolean;
  }>> {
    return AgentLogger.measurePerformance(
      'LunaTravelSocialIntegration',
      'getTravelBuddies',
      async () => {
        try {
          let contacts;
          
          if (searchQuery) {
            // Search contacts by query
            contacts = await GooglePeopleAPI.searchContacts(userId, searchQuery, 50);
          } else {
            // Get all contacts
            const result = await GooglePeopleAPI.getContacts(userId, 50);
            contacts = result.contacts;
          }

          // Transform contacts to our format
          return contacts.map(contact => {
            const name = contact.names?.[0]?.displayName || 'Unknown';
            const email = contact.emailAddresses?.[0]?.value;
            const phone = contact.phoneNumbers?.[0]?.value;
            const photoUrl = contact.photos?.find(photo => !photo.default)?.url;

            return {
              id: contact.resourceName,
              name,
              email,
              phone,
              photoUrl,
              isTravelBuddy: false
            };
          });
        } catch (error) {
          console.error('Error getting travel buddies:', error);
          throw error;
        }
      },
      { userId, hasSearchQuery: !!searchQuery }
    );
  }

  /**
   * Share travel plan with selected contacts
   * @param userId - ZentixOS user ID
   * @param planId - Travel plan ID
   * @param selectedContacts - Array of selected contact IDs
   * @param planDetails - Details about the travel plan
   */
  static async shareTravelPlan(
    userId: string,
    planId: string,
    selectedContacts: string[],
    planDetails: {
      destination: string;
      startDate: string;
      endDate: string;
      travelers: number;
      budget?: number;
    }
  ): Promise<{
    success: boolean;
    sharedCount: number;
    failedContacts: string[];
    message: string;
  }> {
    return AgentLogger.measurePerformance(
      'LunaTravelSocialIntegration',
      'shareTravelPlan',
      async () => {
        try {
          const failedContacts: string[] = [];
          let sharedCount = 0;

          // For each selected contact, send a travel plan share
          for (const contactId of selectedContacts) {
            try {
              // In a real implementation, this would send an actual travel plan share
              // For now, we'll just simulate the process
              console.log(`Sharing travel plan ${planId} with contact ${contactId}`);
              sharedCount++;
            } catch (error) {
              console.error(`Failed to share travel plan with contact ${contactId}:`, error);
              failedContacts.push(contactId);
            }
          }

          return {
            success: failedContacts.length === 0,
            sharedCount,
            failedContacts,
            message: failedContacts.length === 0 
              ? `Successfully shared travel plan with ${sharedCount} contacts`
              : `Shared plan with ${sharedCount} contacts, but failed to share with ${failedContacts.length} contacts`
          };
        } catch (error) {
          console.error('Error sharing travel plan:', error);
          throw error;
        }
      },
      { userId, planId, selectedContactsCount: selectedContacts.length }
    );
  }

  /**
   * Create a temporary contact group for travel companions
   * @param userId - ZentixOS user ID
   * @param destination - Travel destination
   * @param travelDates - Travel dates
   * @param companionContacts - Contact resource names of travel companions
   */
  static async createTravelCompanionsGroup(
    userId: string,
    destination: string,
    travelDates: { start: string; end: string },
    companionContacts: string[]
  ): Promise<{
    success: boolean;
    groupId?: string;
    groupName: string;
    message: string;
  }> {
    return AgentLogger.measurePerformance(
      'LunaTravelSocialIntegration',
      'createTravelCompanionsGroup',
      async () => {
        try {
          // Create a contact group for travel companions
          const groupName = `Zentix Travel: ${destination} (${travelDates.start} to ${travelDates.end})`;
          const group = await GooglePeopleAPI.createContactGroup(userId, groupName);
          
          // Add companions to the group
          if (companionContacts.length > 0) {
            await GooglePeopleAPI.addContactsToGroup(userId, group.resourceName, companionContacts);
          }

          return {
            success: true,
            groupId: group.resourceName,
            groupName: group.name,
            message: `Successfully created travel group "${groupName}" with ${companionContacts.length} companions`
          };
        } catch (error: any) {
          console.error('Error creating travel companions group:', error);
          return {
            success: false,
            groupName: `Zentix Travel: ${destination}`,
            message: `Failed to create travel group: ${error.message || error}`
          };
        }
      },
      { userId, destination, companionCount: companionContacts.length }
    );
  }
}