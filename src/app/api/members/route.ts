// Filepath: /Users/martin/Documents/Projects/digital-solutions/misc/sprint-capacity-planner/src/app/api/members/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { TeamMember } from '~/lib/types' // Adjusted path

const membersFilePath = path.join(process.cwd(), 'data', 'members.json')

async function getMembers(): Promise<TeamMember[]> {
  try {
    const data = await fs.readFile(membersFilePath, 'utf-8')
    return JSON.parse(data) as TeamMember[]
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty array
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    console.error('Error reading members file:', error)
    throw new Error('Failed to read members data')
  }
}

async function saveMembers(members: TeamMember[]): Promise<void> {
  try {
    await fs.writeFile(membersFilePath, JSON.stringify(members, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing members file:', error)
    throw new Error('Failed to save members data')
  }
}

export async function GET() {
  try {
    const members = await getMembers()
    return NextResponse.json(members)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching members', error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, emoji } = await request.json()

    if (!name || !emoji) {
      return NextResponse.json({ message: 'Name and emoji are required' }, { status: 400 })
    }

    const members = await getMembers()
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name,
      emoji,
    }
    members.push(newMember)
    await saveMembers(members)

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error creating member', error: (error as Error).message },
      { status: 500 }
    )
  }
}
