/**
 * Common interface for assignments across different platforms
 */
export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  createdDate: Date;
  url: string;
  course: {
    id: string;
    name: string;
  };
  platform: 'Google Classroom' | 'Microsoft Teams' | 'Moodle';
  status: 'assigned' | 'turned in' | 'graded' | 'missing' | 'late';
}

/**
 * Interface for assignment service implementations
 */
export interface AssignmentService {
  /**
   * Fetches assignments from the platform
   */
  fetchAssignments(): Promise<Assignment[]>;
  
  /**
   * Gets the name of the service
   */
  getServiceName(): string;
}

/**
 * Interface for Discord message formatting
 */
export interface MessageFormatter {
  /**
   * Formats assignments into a Discord message
   */
  formatAssignmentsMessage(assignments: Assignment[]): string;
}
