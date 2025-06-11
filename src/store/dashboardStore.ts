'use client';

import { create } from 'zustand';
import { ClientWorkload, MemberWorkload, calculateClientWorkloads, calculateMemberWorkloads, calculateAverageMemberWorkload } from '~/lib/dashboard';
import { Sprint } from '~/lib/types';

interface DashboardState {
  clientWorkloads: ClientWorkload[];
  memberWorkloads: MemberWorkload[];
  averageMemberWorkloadPercentage: number;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  clientWorkloads: [],
  memberWorkloads: [],
  averageMemberWorkloadPercentage: 0,
  isLoading: false,
  error: null,
  
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch all sprints
      const response = await fetch('/api/sprints');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch sprints for dashboard');
      }
      
      const sprints: Sprint[] = await response.json();
      
      // Calculate metrics
      const clientWorkloads = calculateClientWorkloads(sprints);
      const memberWorkloads = calculateMemberWorkloads(sprints);
      const averageMemberWorkloadPercentage = calculateAverageMemberWorkload(memberWorkloads);
      
      set({
        clientWorkloads,
        memberWorkloads,
        averageMemberWorkloadPercentage,
        isLoading: false
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ 
        isLoading: false, 
        error: errorMessage,
        clientWorkloads: [],
        memberWorkloads: [],
        averageMemberWorkloadPercentage: 0
      });
      console.error('Error fetching dashboard data:', errorMessage);
    }
  }
}));
