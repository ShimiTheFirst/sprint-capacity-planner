// Filepath: /Users/martin/Documents/Projects/digital-solutions/misc/sprint-capacity-planner/src/store/memberStore.ts
import { create } from 'zustand'
import { TeamMember } from '~/lib/types'

interface MemberState {
  members: TeamMember[]
  isLoading: boolean
  error: string | null
  fetchMembers: () => Promise<void>
  addMember: (name: string, emoji: string) => Promise<TeamMember | null>
  removeMember: (memberId: string) => Promise<void>
  // updateMember: (memberId: string, name?: string, emoji?: string) => Promise<TeamMember | null>; // Future consideration
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/members')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch members')
      }
      const data: TeamMember[] = await response.json()
      set({ members: data, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message })
      console.error('Error fetching members:', error)
    }
  },

  addMember: async (name: string, emoji: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, emoji }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add member')
      }
      const newMember: TeamMember = await response.json()
      // set((state) => ({ members: [...state.members, newMember], isLoading: false }));
      await get().fetchMembers() // Refetch to ensure data consistency and get the latest list
      return newMember
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message })
      console.error('Error adding member:', error)
      return null
    }
  },

  removeMember: async (memberId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to remove member')
      }
      // set((state) => ({
      //   members: state.members.filter((member) => member.id !== memberId),
      //   isLoading: false
      // }));
      await get().fetchMembers() // Refetch to ensure data consistency
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message })
      console.error('Error removing member:', error)
    }
  },
}))
