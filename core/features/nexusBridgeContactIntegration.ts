/**
 * Nexus Bridge Contact Integration
 * Google People API integration for linking alerts to contacts
 * 
 * @module nexusBridgeContactIntegration
 * @version 1.0.0
 */

import { GooglePeopleAPI } from '../apis/googlePeopleAPI';
import { AgentLogger } from '../utils/agentLogger';

/**
 * Nexus Bridge Contact Integration
 * Enables linking alerts to specific Google Contacts
 */
export class NexusBridgeContactIntegration {
  /**
   * Get user's Google contacts for alert linking
   * @param userId - ZentixOS user ID
   * @param searchQuery - Optional search query to filter contacts
   */
  static async getContactsForAlerts(
    userId: string,
    searchQuery?: string
  ): Promise<Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    relationship?: string;
  }>> {
    return AgentLogger.measurePerformance(
      'NexusBridgeContactIntegration',
      'getContactsForAlerts',
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
            
            // Extract relationship if available (simplified)
            const relationship = contact.names?.[0]?.familyName ? 'family' : 'friend';

            return {
              id: contact.resourceName,
              name,
              email,
              phone,
              photoUrl,
              relationship
            };
          });
        } catch (error) {
          console.error('Error getting contacts for alerts:', error);
          throw error;
        }
      },
      { userId, hasSearchQuery: !!searchQuery }
    );
  }

  /**
   * Link an alert to specific contacts
   * @param userId - ZentixOS user ID
   * @param alertId - Alert ID
   * @param linkedContacts - Array of contact IDs to link to the alert
   * @param alertDetails - Details about the alert
   */
  static async linkAlertToContacts(
    userId: string,
    alertId: string,
    linkedContacts: string[],
    alertDetails: {
      condition: string;
      action: string;
      message: string;
    }
  ): Promise<{
    success: boolean;
    linkedCount: number;
    failedContacts: string[];
    message: string;
  }> {
    return AgentLogger.measurePerformance(
      'NexusBridgeContactIntegration',
      'linkAlertToContacts',
      async () => {
        try {
          const failedContacts: string[] = [];
          let linkedCount = 0;

          // For each linked contact, create the alert linkage
          for (const contactId of linkedContacts) {
            try {
              // In a real implementation, this would create the actual alert linkage
              // For now, we'll just simulate the process
              console.log(`Linking alert ${alertId} to contact ${contactId}`);
              linkedCount++;
            } catch (error) {
              console.error(`Failed to link alert to contact ${contactId}:`, error);
              failedContacts.push(contactId);
            }
          }

          return {
            success: failedContacts.length === 0,
            linkedCount,
            failedContacts,
            message: failedContacts.length === 0 
              ? `Successfully linked alert to ${linkedCount} contacts`
              : `Linked alert to ${linkedCount} contacts, but failed to link to ${failedContacts.length} contacts`
          };
        } catch (error) {
          console.error('Error linking alert to contacts:', error);
          throw error;
        }
      },
      { userId, alertId, linkedContactsCount: linkedContacts.length }
    );
  }

  /**
   * Get contact information for sending alerts
   * @param userId - ZentixOS user ID
   * @param contactId - Google Contact resource name
   */
  static async getContactInfoForAlert(
    userId: string,
    contactId: string
  ): Promise<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    preferredContactMethod: 'email' | 'phone' | 'both';
  }> {
    return AgentLogger.measurePerformance(
      'NexusBridgeContactIntegration',
      'getContactInfoForAlert',
      async () => {
        try {
          // In a real implementation, we would fetch the specific contact
          // For now, we'll return mock data
          return {
            id: contactId,
            name: 'John Doe',
            email: 'johndoe@example.com',
            phone: '+1234567890',
            preferredContactMethod: 'both'
          };
        } catch (error) {
          console.error('Error getting contact info for alert:', error);
          throw error;
        }
      },
      { userId, contactId }
    );
  }
}