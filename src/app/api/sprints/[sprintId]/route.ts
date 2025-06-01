// Filepath: /Users/martin/Documents/Projects/digital-solutions/misc/sprint-capacity-planner/src/app/api/sprints/[sprintId]/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Sprint } from '~/lib/types'

const dataDir = path.join(process.cwd(), 'data')

export async function GET(request: Request, { params }: { params: { sprintId: string } }) {
  const { sprintId } = await params

  try {
    const sprintFilePath = path.join(dataDir, `${sprintId}.json`)
    const fileContent = await fs.readFile(sprintFilePath, 'utf-8')
    const sprint = JSON.parse(fileContent) as Sprint
    return NextResponse.json(sprint)
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ message: 'Sprint not found' }, { status: 404 })
    }
    console.error(`Error fetching sprint ${sprintId}:`, error)
    return NextResponse.json(
      { message: 'Error fetching sprint', error: (error as Error).message },
      { status: 500 }
    )
  }
}

// PUT and DELETE for a specific sprint might be more complex if they involve
// extensive modifications or if sprints are considered largely immutable once created.
// For now, we are focusing on task management within a sprint, which will have its own routes.
// If direct sprint modification (e.g., changing its name or dates) is needed later,
// those handlers can be added here.
