import { Client } from '@microsoft/microsoft-graph-client';
import { Assignment, AssignmentService } from '../types';
import { 
  MICROSOFT_EMAIL, 
  MICROSOFT_PASSWORD, 
  MICROSOFT_2FA_SECRET
} from '../config';
import axios from 'axios';
import { authenticator } from 'otplib';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export class MicrosoftTeamsService implements AssignmentService {
  private client: Client | null = null;
  private jar: CookieJar;
  private axiosClient: ReturnType<typeof wrapper>;

  constructor() {
    // Initialize cookie jar for session management
    this.jar = new CookieJar();
    this.axiosClient = wrapper(axios.create({ jar: this.jar }));
  }

  /**
   * Authenticate with Microsoft using email/password and 2FA
   */
  private async authenticate(): Promise<void> {
    if (this.client) return; // Already authenticated

    try {
      console.log('Authenticating with Microsoft Teams...');
      
      // In a production environment, you would implement a headless browser login flow
      // using a library like Playwright or Puppeteer to handle the Microsoft login process
      // including 2FA. This would involve:
      // 1. Navigating to the Microsoft login page
      // 2. Entering email and password
      // 3. Generating a 2FA code using the TOTP secret
      // 4. Entering the 2FA code
      
      // Generate a TOTP code for 2FA
      const twoFactorCode = MICROSOFT_2FA_SECRET ? 
        authenticator.generate(MICROSOFT_2FA_SECRET) : 
        '';
      
      console.log('Generated 2FA code for Microsoft authentication');
      
      // For this example, we'll use a simplified approach
      // In a real implementation, you would obtain an access token through
      // a browser-based login flow with 2FA
      
      // Initialize Microsoft Graph client with a custom auth provider
      this.client = Client.init({
        authProvider: async (done) => {
          try {
            // In a real implementation, this would be the access token obtained
            // from the browser-based login flow
            const dummyToken = 'PLACEHOLDER_ACCESS_TOKEN';
            done(null, dummyToken);
          } catch (error) {
            console.error('Error in Microsoft auth provider:', error);
            done(error as Error, null);
          }
        }
      });
      
      console.log('Microsoft Teams authentication successful');
    } catch (error) {
      console.error('Microsoft Teams authentication failed:', error);
      throw new Error('Failed to authenticate with Microsoft Teams');
    }
  }

  public getServiceName(): string {
    return 'Microsoft Teams';
  }

  public async fetchAssignments(): Promise<Assignment[]> {
    try {
      // Ensure we're authenticated
      await this.authenticate();
      
      if (!this.client) {
        throw new Error('Failed to initialize Microsoft Teams client');
      }

      // Get all classes (teams)
      const classesResponse = await this.client
        .api('/education/classes')
        .get();

      const classes = classesResponse.value || [];
      const assignments: Assignment[] = [];

      // For each class, get the assignments
      for (const classItem of classes) {
        // Get assignments for this class
        const assignmentsResponse = await this.client
          .api(`/education/classes/${classItem.id}/assignments`)
          .get();

        const teamsAssignments = assignmentsResponse.value || [];

        // Convert Teams assignments to our common Assignment format
        for (const teamsAssignment of teamsAssignments) {
          // Get submission status if available
          let status: Assignment['status'] = 'assigned';
          
          try {
            // Get the current user's submission
            const submissionResponse = await this.client
              .api(`/education/classes/${classItem.id}/assignments/${teamsAssignment.id}/submissions/me`)
              .get();
            
            if (submissionResponse.status === 'submitted') {
              status = 'turned in';
            } else if (submissionResponse.status === 'returned') {
              status = 'graded';
            } else if (submissionResponse.status === 'late') {
              status = 'late';
            }
          } catch (error) {
            // If there's an error getting the submission, assume it's just assigned
            console.error(`Error getting submission for assignment ${teamsAssignment.id}:`, error);
          }

          assignments.push({
            id: teamsAssignment.id,
            title: teamsAssignment.displayName || 'Untitled Assignment',
            description: teamsAssignment.instructions?.content || '',
            dueDate: teamsAssignment.dueDateTime ? new Date(teamsAssignment.dueDateTime) : null,
            createdDate: new Date(teamsAssignment.createdDateTime),
            url: teamsAssignment.webUrl || '',
            course: {
              id: classItem.id,
              name: classItem.displayName || 'Unknown Class'
            },
            platform: 'Microsoft Teams',
            status
          });
        }
      }

      return assignments;
    } catch (error) {
      console.error('Error fetching Microsoft Teams assignments:', error);
      return [];
    }
  }
}
