'use client'

import { create } from 'zustand'
import { Sprint, Task } from '~/lib/types'

interface CreateSprintDto {
  name: string
  startDate: string
  endDate: string
}

interface AddTaskDto {
  sprintId: string // To identify which sprint to add the task to
  memberId: string // To identify which member to assign the task to
  description: string
  clientName: string
  time: number
}

interface UpdateTaskDto {
  sprintId: string // To identify the sprint
  taskId: string // To identify the task to update
  description?: string
  clientName?: string
  time?: number
  // assignedToMemberId could also be updatable if needed, but keeping it simple for now
}

interface SprintState {
  sprints: Sprint[]
  activeSprint: Sprint | null // Potentially for the "Current Sprint" page
  activeSprintDetail: Sprint | null // For the sprint detail page
  isLoading: boolean
  error: string | null
  fetchSprints: () => Promise<void>
  createSprint: (sprintData: CreateSprintDto) => Promise<Sprint | undefined>
  fetchSprintById: (sprintId: string) => Promise<void>
  setActiveSprintDetail: (sprint: Sprint | null) => void
  addTask: (taskData: AddTaskDto) => Promise<Task | undefined>
  updateTask: (taskData: UpdateTaskDto) => Promise<Task | undefined>
  removeTask: (sprintId: string, taskId: string, memberId: string) => Promise<void>
}

export const useSprintStore = create<SprintState>((set) => ({
  sprints: [],
  activeSprint: null,
  activeSprintDetail: null,
  isLoading: false,
  error: null,
  fetchSprints: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/sprints')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch sprints')
      }
      const sprints = await response.json()
      set({ sprints, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ isLoading: false, error: errorMessage })
      console.error('Error fetching sprints:', errorMessage)
    }
  },
  createSprint: async (sprintData: CreateSprintDto) => {
    // Changed parameter type
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sprintData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create sprint')
      }
      const newSprint = await response.json()
      set((state) => ({
        sprints: [...state.sprints, newSprint],
        isLoading: false,
      }))
      return newSprint
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ isLoading: false, error: errorMessage })
      return undefined
    }
  },
  fetchSprintById: async (sprintId: string) => {
    set({ isLoading: true, error: null, activeSprintDetail: null })
    try {
      const response = await fetch(`/api/sprints/${sprintId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to fetch sprint ${sprintId}`)
      }
      const sprint: Sprint = await response.json()
      set({ activeSprintDetail: sprint, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ isLoading: false, error: errorMessage })
    }
  },
  setActiveSprintDetail: (sprint: Sprint | null) => {
    set({ activeSprintDetail: sprint })
  },

  addTask: async (taskData: AddTaskDto) => {
    const { sprintId, memberId, ...taskPayload } = taskData
    try {
      const response = await fetch(`/api/sprints/${sprintId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskPayload, assignedToMemberId: memberId }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add task')
      }
      const newTask = await response.json()
      set((state) => {
        if (!state.activeSprintDetail || state.activeSprintDetail.sprintId !== sprintId) {
          return state // Or fetch the sprint again
        }
        const updatedTeamSnapshot = state.activeSprintDetail.teamSnapshot.map((member) => {
          if (member.memberId === memberId) {
            const newTasks = [...member.tasks, newTask]
            return {
              ...member,
              tasks: newTasks,
              filledCapacity: newTasks.reduce((acc, t) => acc + t.time, 0),
            }
          }
          return member
        })
        return {
          activeSprintDetail: {
            ...state.activeSprintDetail,
            teamSnapshot: updatedTeamSnapshot,
          },
        }
      })
      return newTask
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ isLoading: false, error: errorMessage })
      return undefined
    }
  },

  updateTask: async (taskData: UpdateTaskDto) => {
    const { sprintId, taskId, ...taskPayload } = taskData
    try {
      const response = await fetch(`/api/sprints/${sprintId}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, ...taskPayload }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update task')
      }
      const updatedTask = await response.json()
      set((state) => {
        if (!state.activeSprintDetail || state.activeSprintDetail.sprintId !== sprintId) {
          return state
        }
        const updatedTeamSnapshot = state.activeSprintDetail.teamSnapshot.map((member) => {
          const taskIndex = member.tasks.findIndex((t) => t.taskId === taskId)
          if (taskIndex !== -1) {
            const newTasks = [...member.tasks]
            newTasks[taskIndex] = updatedTask
            return {
              ...member,
              tasks: newTasks,
              filledCapacity: newTasks.reduce((acc, t) => acc + t.time, 0),
            }
          }
          return member
        })
        return {
          activeSprintDetail: {
            ...state.activeSprintDetail,
            teamSnapshot: updatedTeamSnapshot,
          },
        }
      })
      return updatedTask
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ isLoading: false, error: errorMessage })
      return undefined
    }
  },

  removeTask: async (sprintId: string, taskId: string, memberId: string) => {
    try {
      const response = await fetch(`/api/sprints/${sprintId}/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete task')
      }
      set((state) => {
        if (!state.activeSprintDetail || state.activeSprintDetail.sprintId !== sprintId) {
          return state
        }
        const updatedTeamSnapshot = state.activeSprintDetail.teamSnapshot.map((member) => {
          if (member.memberId === memberId) {
            const newTasks = member.tasks.filter((t) => t.taskId !== taskId)
            return {
              ...member,
              tasks: newTasks,
              filledCapacity: newTasks.reduce((acc, t) => acc + t.time, 0),
            }
          }
          return member
        })
        return {
          activeSprintDetail: {
            ...state.activeSprintDetail,
            teamSnapshot: updatedTeamSnapshot,
          },
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      set({ isLoading: false, error: errorMessage })
    }
  },
}))
