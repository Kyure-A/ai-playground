import { Assignment, MessageFormatter } from '../types';

export class DiscordFormatter implements MessageFormatter {
  /**
   * Formats a list of assignments into a Discord message
   */
  public formatAssignmentsMessage(assignments: Assignment[]): string {
    if (assignments.length === 0) {
      return 'No assignments found.';
    }

    // Group assignments by platform
    const groupedByPlatform: Record<string, Assignment[]> = {};
    
    for (const assignment of assignments) {
      if (!groupedByPlatform[assignment.platform]) {
        groupedByPlatform[assignment.platform] = [];
      }
      groupedByPlatform[assignment.platform].push(assignment);
    }

    // Format the message
    let message = '# 📚 Assignment Updates\n\n';
    
    // Add current date
    const now = new Date();
    message += `**Date:** ${now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}\n\n`;

    // Add assignments by platform
    for (const [platform, platformAssignments] of Object.entries(groupedByPlatform)) {
      message += `## ${platform} (${platformAssignments.length})\n\n`;
      
      // Group by course
      const groupedByCourse: Record<string, Assignment[]> = {};
      
      for (const assignment of platformAssignments) {
        const courseId = assignment.course.id;
        if (!groupedByCourse[courseId]) {
          groupedByCourse[courseId] = [];
        }
        groupedByCourse[courseId].push(assignment);
      }
      
      // Add assignments by course
      for (const [courseId, courseAssignments] of Object.entries(groupedByCourse)) {
        const courseName = courseAssignments[0].course.name;
        message += `### ${courseName}\n\n`;
        
        for (const assignment of courseAssignments) {
          // Format due date
          let dueString = 'No due date';
          if (assignment.dueDate) {
            dueString = assignment.dueDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
          
          // Format status with emoji
          let statusEmoji = '';
          switch (assignment.status) {
            case 'assigned':
              statusEmoji = '📝';
              break;
            case 'turned in':
              statusEmoji = '✅';
              break;
            case 'graded':
              statusEmoji = '🎓';
              break;
            case 'missing':
              statusEmoji = '❌';
              break;
            case 'late':
              statusEmoji = '⚠️';
              break;
          }
          
          // Add assignment details
          message += `${statusEmoji} **[${assignment.title}](${assignment.url})**\n`;
          message += `> Due: ${dueString} | Status: ${assignment.status}\n`;
          
          // Add description if available (truncated)
          if (assignment.description) {
            const maxLength = 100;
            const description = assignment.description.length > maxLength
              ? assignment.description.substring(0, maxLength) + '...'
              : assignment.description;
            
            message += `> ${description.replace(/\n/g, ' ')}\n`;
          }
          
          message += '\n';
        }
      }
    }
    
    // Add footer
    message += '---\n';
    message += '*This is an automated message from your Assignment Bot.*';
    
    return message;
  }

  /**
   * Formats overdue assignments into a warning message
   */
  public formatOverdueMessage(assignments: Assignment[]): string {
    if (assignments.length === 0) {
      return 'No overdue assignments.';
    }

    let message = '# ⚠️ Overdue Assignments\n\n';
    
    // Group by platform
    const groupedByPlatform: Record<string, Assignment[]> = {};
    
    for (const assignment of assignments) {
      if (!groupedByPlatform[assignment.platform]) {
        groupedByPlatform[assignment.platform] = [];
      }
      groupedByPlatform[assignment.platform].push(assignment);
    }
    
    // Add assignments by platform
    for (const [platform, platformAssignments] of Object.entries(groupedByPlatform)) {
      message += `## ${platform} (${platformAssignments.length})\n\n`;
      
      for (const assignment of platformAssignments) {
        // Format due date
        let dueString = 'Unknown';
        if (assignment.dueDate) {
          const daysLate = Math.floor((Date.now() - assignment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          dueString = `${daysLate} day${daysLate !== 1 ? 's' : ''} ago`;
        }
        
        // Add assignment details
        message += `⚠️ **[${assignment.title}](${assignment.url})**\n`;
        message += `> Course: ${assignment.course.name}\n`;
        message += `> Due: ${dueString}\n\n`;
      }
    }
    
    // Add footer
    message += '---\n';
    message += '*Please submit these assignments as soon as possible.*';
    
    return message;
  }
}
