import { Assignment, AssignmentService } from '../types';
import { GoogleClassroomService } from './googleClassroomService';
import { MicrosoftTeamsService } from './microsoftTeamsService';
import { MoodleService } from './moodleService';

export class AssignmentManager {
  private services: AssignmentService[] = [];

  constructor() {
    // Initialize services based on available credentials
    this.initializeServices();
  }

  private initializeServices(): void {
    try {
      // Add Google Classroom service
      this.services.push(new GoogleClassroomService());
      console.log('Google Classroom service initialized');
    } catch (error) {
      console.error('Failed to initialize Google Classroom service:', error);
    }

    try {
      // Add Microsoft Teams service
      this.services.push(new MicrosoftTeamsService());
      console.log('Microsoft Teams service initialized');
    } catch (error) {
      console.error('Failed to initialize Microsoft Teams service:', error);
    }

    try {
      // Add Moodle service
      this.services.push(new MoodleService());
      console.log('Moodle service initialized');
    } catch (error) {
      console.error('Failed to initialize Moodle service:', error);
    }
  }

  /**
   * Fetches assignments from all configured services
   */
  public async fetchAllAssignments(): Promise<Assignment[]> {
    const allAssignments: Assignment[] = [];
    const errors: Error[] = [];

    // Fetch assignments from each service in parallel
    const assignmentPromises = this.services.map(async (service) => {
      try {
        console.log(`Fetching assignments from ${service.getServiceName()}...`);
        const assignments = await service.fetchAssignments();
        console.log(`Found ${assignments.length} assignments from ${service.getServiceName()}`);
        return assignments;
      } catch (error) {
        console.error(`Error fetching assignments from ${service.getServiceName()}:`, error);
        errors.push(error as Error);
        return [];
      }
    });

    // Wait for all promises to resolve
    const assignmentsArrays = await Promise.all(assignmentPromises);

    // Combine all assignments
    for (const assignments of assignmentsArrays) {
      allAssignments.push(...assignments);
    }

    // Sort assignments by due date (null dates at the end)
    return allAssignments.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  /**
   * Gets assignments due within the specified number of days
   */
  public async getUpcomingAssignments(days: number = 7): Promise<Assignment[]> {
    const allAssignments = await this.fetchAllAssignments();
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return allAssignments.filter(assignment => {
      // Include assignments with no due date
      if (!assignment.dueDate) return true;
      
      // Include assignments due before the cutoff
      return assignment.dueDate <= cutoff;
    });
  }

  /**
   * Gets assignments that are overdue
   */
  public async getOverdueAssignments(): Promise<Assignment[]> {
    const allAssignments = await this.fetchAllAssignments();
    const now = new Date();

    return allAssignments.filter(assignment => {
      // Exclude assignments with no due date
      if (!assignment.dueDate) return false;
      
      // Include assignments that are past due and not turned in or graded
      return assignment.dueDate < now && 
             assignment.status !== 'turned in' && 
             assignment.status !== 'graded';
    });
  }
}
