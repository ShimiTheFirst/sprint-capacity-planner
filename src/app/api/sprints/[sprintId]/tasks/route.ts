import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Sprint, Task } from '~/lib/types' // Removed MemberCapacity
import crypto from 'crypto'

const dataDir = path.join(process.cwd(), 'data')

// Helper function to read sprint data
async function getSprint(sprintId: string): Promise<Sprint | null> {
  const filePath = path.join(dataDir, `${sprintId}.json`)
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(fileContent) as Sprint
  } catch {
    // Renamed error to e to avoid conflict with other error variables
    // console.error(`Error reading sprint file ${sprintId}.json:`, e);
    return null
  }
}

// Helper function to save sprint data
async function saveSprint(sprintId: string, data: Sprint): Promise<void> {
  const filePath = path.join(dataDir, `${sprintId}.json`)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

export async function POST(request: NextRequest, { params }: { params: { sprintId: string } }) {
  const { sprintId } = params
  if (!sprintId) {
    return NextResponse.json({ message: 'Sprint ID is required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { description, clientName, time, assignedToMemberId } = body

    if (!description || !clientName || typeof time !== 'number' || !assignedToMemberId) {
      return NextResponse.json({ message: 'Missing required task fields' }, { status: 400 })
    }

    const sprint = await getSprint(sprintId)
    if (!sprint) {
      return NextResponse.json({ message: 'Sprint not found' }, { status: 404 })
    }

    const memberIndex = sprint.teamSnapshot.findIndex(
      (member) => member.memberId === assignedToMemberId
    )

    if (memberIndex === -1) {
      return NextResponse.json({ message: 'Member not found in sprint' }, { status: 404 })
    }

    const newTask: Task = {
      taskId: crypto.randomUUID(),
      description,
      clientName,
      time,
      assignedToMemberId,
    }

    // Add task to the member
    sprint.teamSnapshot[memberIndex].tasks.push(newTask)

    // Recalculate filledCapacity for the member
    sprint.teamSnapshot[memberIndex].filledCapacity = sprint.teamSnapshot[memberIndex].tasks.reduce(
      (acc, currentTask) => acc + currentTask.time,
      0
    )

    await saveSprint(sprintId, sprint)

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error(`Error in POST /api/sprints/${sprintId}/tasks:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { message: 'Failed to add task', error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest, // request is unused, but required by Next.js
  { params }: { params: { sprintId: string } }
) {
  const { sprintId } = params
  if (!sprintId) {
    return NextResponse.json({ message: 'Sprint ID is required' }, { status: 400 })
  }

  try {
    const sprint = await getSprint(sprintId)
    if (!sprint) {
      return NextResponse.json({ message: 'Sprint not found' }, { status: 404 })
    }

    // Collect all tasks from all members in the team snapshot
    const allTasks: Task[] = sprint.teamSnapshot.reduce((acc: Task[], member) => {
      return acc.concat(member.tasks)
    }, [])

    return NextResponse.json(allTasks, { status: 200 })
  } catch (error) {
    console.error(`Error in GET /api/sprints/${sprintId}/tasks:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { message: 'Failed to fetch tasks', error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { sprintId: string } }) {
  const { sprintId } = params
  if (!sprintId) {
    return NextResponse.json({ message: 'Sprint ID is required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { taskId, description, clientName, time } = body

    if (
      !taskId ||
      typeof description !== 'string' ||
      typeof clientName !== 'string' ||
      typeof time !== 'number'
    ) {
      return NextResponse.json(
        { message: 'Task ID and valid description, clientName, and time are required for update' },
        { status: 400 }
      )
    }

    const sprint = await getSprint(sprintId)
    if (!sprint) {
      return NextResponse.json({ message: 'Sprint not found' }, { status: 404 })
    }

    let updatedTask: Task | null = null
    let memberIndex = -1

    for (let i = 0; i < sprint.teamSnapshot.length; i++) {
      const taskIndex = sprint.teamSnapshot[i].tasks.findIndex((task) => task.taskId === taskId)
      if (taskIndex !== -1) {
        memberIndex = i
        // Update task details
        sprint.teamSnapshot[i].tasks[taskIndex] = {
          ...sprint.teamSnapshot[i].tasks[taskIndex],
          description,
          clientName,
          time,
        }
        updatedTask = sprint.teamSnapshot[i].tasks[taskIndex]
        break // Task found and updated, exit loop
      }
    }

    if (!updatedTask || memberIndex === -1) {
      return NextResponse.json({ message: 'Task not found in sprint' }, { status: 404 })
    }

    // Recalculate filledCapacity for the affected member
    sprint.teamSnapshot[memberIndex].filledCapacity = sprint.teamSnapshot[memberIndex].tasks.reduce(
      (acc, currentTask) => acc + currentTask.time,
      0
    )

    await saveSprint(sprintId, sprint)

    return NextResponse.json(updatedTask, { status: 200 })
  } catch (error) {
    console.error(`Error in PUT /api/sprints/${sprintId}/tasks:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { message: 'Failed to update task', error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { sprintId: string } }) {
  const { sprintId } = params
  const taskId = request.nextUrl.searchParams.get('taskId')

  if (!sprintId) {
    return NextResponse.json({ message: 'Sprint ID is required' }, { status: 400 })
  }
  if (!taskId) {
    return NextResponse.json(
      { message: 'Task ID is required as a query parameter' },
      { status: 400 }
    )
  }

  try {
    const sprint = await getSprint(sprintId)
    if (!sprint) {
      return NextResponse.json({ message: 'Sprint not found' }, { status: 404 })
    }

    let taskFoundAndDeleted = false
    let memberIndex = -1

    for (let i = 0; i < sprint.teamSnapshot.length; i++) {
      const initialTasksLength = sprint.teamSnapshot[i].tasks.length
      sprint.teamSnapshot[i].tasks = sprint.teamSnapshot[i].tasks.filter(
        (task) => task.taskId !== taskId
      )
      if (sprint.teamSnapshot[i].tasks.length < initialTasksLength) {
        memberIndex = i
        taskFoundAndDeleted = true
        break // Task found and deleted, exit loop
      }
    }

    if (!taskFoundAndDeleted || memberIndex === -1) {
      return NextResponse.json({ message: 'Task not found in sprint' }, { status: 404 })
    }

    // Recalculate filledCapacity for the affected member
    sprint.teamSnapshot[memberIndex].filledCapacity = sprint.teamSnapshot[memberIndex].tasks.reduce(
      (acc, currentTask) => acc + currentTask.time,
      0
    )

    await saveSprint(sprintId, sprint)

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 }) // Or 204 No Content
  } catch (error) {
    console.error(`Error in DELETE /api/sprints/${sprintId}/tasks:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { message: 'Failed to delete task', error: errorMessage },
      { status: 500 }
    )
  }
}
