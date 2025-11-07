/**
 * Chill Room Social Integration
 * Google People API integration for social features in Chill Room
 * 
 * @module chillRoomSocialIntegration
 * @version 1.0.0
 */

import { GooglePeopleAPI } from '../apis/googlePeopleAPI';
import { AgentLogger } from '../utils/agentLogger';

/**
 * Chill Room Social Integration
 * Enables social features using Google Contacts
 */
export class ChillRoomSocialIntegration {
  /**
   * Get user's Google contacts for invitation
   * @param userId - ZentixOS user ID
   * @param searchQuery - Optional search query to filter contacts
   */
  static async getContactsForInvitation(
    userId: string,
    searchQuery?: string
  ): Promise<Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    isSelected: boolean;
  }>> {
    return AgentLogger.measurePerformance(
      'ChillRoomSocialIntegration',
      'getContactsForInvitation',
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
              isSelected: false
            };
          });
        } catch (error) {
          console.error('Error getting contacts for invitation:', error);
          throw error;
        }
      },
      { userId, hasSearchQuery: !!searchQuery }
    );
  }

  /**
   * Invite selected contacts to a Chill Room
   * @param userId - ZentixOS user ID
   * @param roomId - Chill Room ID
   * @param selectedContacts - Array of selected contact IDs
   * @param roomDetails - Details about the room to include in invitation
   */
  static async inviteContactsToChillRoom(
    userId: string,
    roomId: string,
    selectedContacts: string[],
    roomDetails: {
      roomName: string;
      roomDescription?: string;
      startTime?: string;
      endTime?: string;
    }
  ): Promise<{
    success: boolean;
    invitedCount: number;
    failedContacts: string[];
    message: string;
  }> {
    return AgentLogger.measurePerformance(
      'ChillRoomSocialIntegration',
      'inviteContactsToChillRoom',
      async () => {
        try {
          const failedContacts: string[] = [];
          let invitedCount = 0;

          // For each selected contact, send an invitation
          for (const contactId of selectedContacts) {
            try {
              // In a real implementation, this would send an actual invitation
              // For now, we'll just simulate the process
              console.log(`Inviting contact ${contactId} to Chill Room ${roomId}`);
              invitedCount++;
            } catch (error) {
              console.error(`Failed to invite contact ${contactId}:`, error);
              failedContacts.push(contactId);
            }
          }

          return {
            success: failedContacts.length === 0,
            invitedCount,
            failedContacts,
            message: failedContacts.length === 0 
              ? `Successfully invited ${invitedCount} contacts to the Chill Room`
              : `Invited ${invitedCount} contacts, but failed to invite ${failedContacts.length} contacts`
          };
        } catch (error) {
          console.error('Error inviting contacts to Chill Room:', error);
          throw error;
        }
      },
      { userId, roomId, selectedContactsCount: selectedContacts.length }
    );
  }

  /**
   * Create a temporary contact group for Chill Room participants
   * @param userId - ZentixOS user ID
   * @param roomName - Name of the Chill Room
   * @param participantContacts - Contact resource names of participants
   */
  static async createChillRoomContactGroup(
    userId: string,
    roomName: string,
    participantContacts: string[]
  ): Promise<{
    success: boolean;
    groupId?: string;
    groupName: string;
    message: string;
  }> {
    return AgentLogger.measurePerformance(
      'ChillRoomSocialIntegration',
      'createChillRoomContactGroup',
      async () => {
        try {
          // Create a contact group for the Chill Room
          const groupName = `Zentix Chill Room: ${roomName}`;
          const group = await GooglePeopleAPI.createContactGroup(userId, groupName);
          
          // Add participants to the group
          if (participantContacts.length > 0) {
            await GooglePeopleAPI.addContactsToGroup(userId, group.resourceName, participantContacts);
          }

          return {
            success: true,
            groupId: group.resourceName,
            groupName: group.name,
            message: `Successfully created contact group "${groupName}" with ${participantContacts.length} participants`
          };
        } catch (error: any) {
          console.error('Error creating Chill Room contact group:', error);
          return {
            success: false,
            groupName: `Zentix Chill Room: ${roomName}`,
            message: `Failed to create contact group: ${error.message || error}`
          };
        }
      },
      { userId, roomName, participantCount: participantContacts.length }
    );
  }
}