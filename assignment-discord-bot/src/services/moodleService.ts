import { Assignment, AssignmentService } from '../types';
import { MOODLE_URL, MOODLE_USERNAME, MOODLE_PASSWORD } from '../config';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
}

interface MoodleAssignment {
  id: number;
  cmid: number;
  course: number;
  name: string;
  intro: string;
  duedate: number;
  timemodified: number;
  coursemodule: number;
}

interface MoodleSubmission {
  id: number;
  assignment: number;
  status: string;
  timemodified: number;
  gradingstatus: string;
}

export class MoodleService implements AssignmentService {
  private token: string | null = null;
  private jar: CookieJar;
  private client: ReturnType<typeof wrapper>;
  private userId: number | null = null;

  constructor() {
    // Initialize cookie jar for session management
    this.jar = new CookieJar();
    this.client = wrapper(axios.create({ jar: this.jar }));
  }

  public getServiceName(): string {
    return 'Moodle';
  }

  /**
   * Authenticate with Moodle using username and password
   */
  private async authenticate(): Promise<void> {
    if (this.token) return; // Already authenticated

    try {
      console.log('Authenticating with Moodle...');
      
      // Login to Moodle and get a token
      const loginUrl = new URL(`${MOODLE_URL}/login/token.php`);
      loginUrl.searchParams.append('username', MOODLE_USERNAME);
      loginUrl.searchParams.append('password', MOODLE_PASSWORD);
      loginUrl.searchParams.append('service', 'moodle_mobile_app');
      
      const response = await this.client.get(loginUrl.toString());
      
      if (response.data.error) {
        throw new Error(`Moodle authentication error: ${response.data.error}`);
      }
      
      this.token = response.data.token;
      
      // Get user ID
      const siteInfoResponse = await this.callMoodleApi('core_webservice_get_site_info');
      this.userId = siteInfoResponse.userid;
      
      console.log('Moodle authentication successful');
    } catch (error) {
      console.error('Moodle authentication failed:', error);
      throw new Error('Failed to authenticate with Moodle');
    }
  }

  private async callMoodleApi(functionName: string, params: Record<string, any> = {}): Promise<any> {
    try {
      // Ensure we're authenticated
      if (!this.token) {
        await this.authenticate();
      }
      
      if (!this.token) {
        throw new Error('Failed to obtain Moodle token');
      }
      
      const url = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
      
      // Add standard parameters
      url.searchParams.append('wstoken', this.token);
      url.searchParams.append('moodlewsrestformat', 'json');
      url.searchParams.append('wsfunction', functionName);
      
      // Add custom parameters
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value.toString());
      }
      
      const response = await this.client.get(url.toString());
      const data = response.data;
      
      if (data.exception) {
        throw new Error(`Moodle API error: ${data.message}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error calling Moodle API function ${functionName}:`, error);
      throw error;
    }
  }

  public async fetchAssignments(): Promise<Assignment[]> {
    try {
      // Ensure we're authenticated
      await this.authenticate();
      
      if (!this.userId) {
        throw new Error('Failed to get Moodle user ID');
      }
      
      // Get user courses
      const courses = await this.callMoodleApi('core_enrol_get_users_courses', {
        userid: this.userId
      }) as MoodleCourse[];
      
      const assignments: Assignment[] = [];
      
      // For each course, get assignments
      for (const course of courses) {
        // Get course assignments
        const courseAssignments = await this.callMoodleApi('mod_assign_get_assignments', {
          courseids: [course.id]
        });
        
        const moodleAssignments = courseAssignments.courses?.[0]?.assignments || [];
        
        // For each assignment, get submission status
        for (const moodleAssignment of moodleAssignments) {
          let status: Assignment['status'] = 'assigned';
          
          try {
            // Get submission status
            const submissions = await this.callMoodleApi('mod_assign_get_submissions', {
              assignmentids: [moodleAssignment.id]
            });
            
            const userSubmission = submissions.assignments?.[0]?.submissions?.[0];
            
            if (userSubmission) {
              if (userSubmission.status === 'submitted') {
                status = 'turned in';
              } else if (userSubmission.gradingstatus === 'graded') {
                status = 'graded';
              } else if (moodleAssignment.duedate < Date.now() / 1000 && userSubmission.status !== 'submitted') {
                status = 'late';
              }
            } else if (moodleAssignment.duedate < Date.now() / 1000) {
              status = 'missing';
            }
          } catch (error) {
            console.error(`Error getting submission for Moodle assignment ${moodleAssignment.id}:`, error);
          }
          
          assignments.push({
            id: moodleAssignment.id.toString(),
            title: moodleAssignment.name,
            description: moodleAssignment.intro,
            dueDate: moodleAssignment.duedate ? new Date(moodleAssignment.duedate * 1000) : null,
            createdDate: new Date(moodleAssignment.timemodified * 1000),
            url: `${MOODLE_URL}/mod/assign/view.php?id=${moodleAssignment.coursemodule}`,
            course: {
              id: course.id.toString(),
              name: course.fullname
            },
            platform: 'Moodle',
            status
          });
        }
      }
      
      return assignments;
    } catch (error) {
      console.error('Error fetching Moodle assignments:', error);
      return [];
    }
  }
}
