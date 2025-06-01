// Filepath: /Users/martin/Documents/Projects/digital-solutions/misc/sprint-capacity-planner/src/lib/types.ts
export interface TeamMember {
  id: string
  name: string
  emoji: string
}

export interface Task {
  taskId: string
  description: string
  clientName: string
  time: number
  assignedToMemberId: string
}

export interface MemberCapacity {
  memberId: string
  name: string
  emoji: string
  maxCapacity: number
  filledCapacity: number
  tasks: Task[]
}

export interface Sprint {
  sprintId: string
  name: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  totalWorkingDays: number
  teamSnapshot: MemberCapacity[]
}
