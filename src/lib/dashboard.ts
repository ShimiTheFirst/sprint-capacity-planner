import { Sprint, Task } from './types';

// Types for dashboard metrics
export interface ClientWorkload {
  clientName: string;
  totalHours: number;
  percentage: number;
}

export interface MemberWorkload {
  memberId: string;
  name: string;
  emoji: string;
  totalHours: number;
  percentage: number;
}

export interface DashboardMetrics {
  clientWorkloads: ClientWorkload[];
  memberWorkloads: MemberWorkload[];
  averageMemberWorkloadPercentage: number;
  isLoading: boolean;
}

/**
 * Calculate workload percentage per client across all sprints
 */
export function calculateClientWorkloads(sprints: Sprint[]): ClientWorkload[] {
  // Collect all tasks from all sprints
  const allTasks: Task[] = sprints.flatMap(sprint => 
    sprint.teamSnapshot.flatMap(member => member.tasks)
  );
  
  // Calculate total hours across all tasks
  const totalHours = allTasks.reduce((sum, task) => sum + task.time, 0);
  
  // Group tasks by client and calculate hours per client
  const clientHours = new Map<string, number>();
  
  allTasks.forEach(task => {
    const currentHours = clientHours.get(task.clientName) || 0;
    clientHours.set(task.clientName, currentHours + task.time);
  });
  
  // Convert to array with percentages
  const clientWorkloads: ClientWorkload[] = Array.from(clientHours.entries())
    .map(([clientName, hours]) => ({
      clientName,
      totalHours: hours,
      percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0
    }))
    .sort((a, b) => b.totalHours - a.totalHours); // Sort by total hours descending
  
  return clientWorkloads;
}

/**
 * Calculate workload percentage per team member across all sprints
 */
export function calculateMemberWorkloads(sprints: Sprint[]): MemberWorkload[] {
  // Create a map to store member info and total hours
  const memberMap = new Map<string, {
    name: string;
    emoji: string;
    totalHours: number;
    totalCapacity: number;
  }>();
  
  // Process all sprints to collect member data
  sprints.forEach(sprint => {
    sprint.teamSnapshot.forEach(member => {
      // Get or initialize member data
      const memberData = memberMap.get(member.memberId) || {
        name: member.name,
        emoji: member.emoji,
        totalHours: 0,
        totalCapacity: 0
      };
      
      // Add hours from this sprint
      memberData.totalHours += member.filledCapacity;
      memberData.totalCapacity += member.maxCapacity;
      
      // Update the map
      memberMap.set(member.memberId, memberData);
    });
  });
  
  // Convert to array with percentages
  const memberWorkloads: MemberWorkload[] = Array.from(memberMap.entries())
    .map(([memberId, data]) => ({
      memberId,
      name: data.name,
      emoji: data.emoji,
      totalHours: data.totalHours,
      percentage: data.totalCapacity > 0 ? (data.totalHours / data.totalCapacity) * 100 : 0
    }))
    .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
  
  return memberWorkloads;
}

/**
 * Calculate average workload percentage across all team members
 */
export function calculateAverageMemberWorkload(memberWorkloads: MemberWorkload[]): number {
  if (memberWorkloads.length === 0) return 0;
  
  const totalPercentage = memberWorkloads.reduce((sum, member) => sum + member.percentage, 0);
  return totalPercentage / memberWorkloads.length;
}
