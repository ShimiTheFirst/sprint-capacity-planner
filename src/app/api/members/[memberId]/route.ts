// Filepath: /Users/martin/Documents/Projects/digital-solutions/misc/sprint-capacity-planner/src/app/api/members/[memberId]/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { TeamMember } from '~/lib/types'

const membersFilePath = path.join(process.cwd(), 'data', 'members.json')

// Helper function to read members from the JSON file
async function getMembers(): Promise<TeamMember[]> {
  try {
    const data = await fs.readFile(membersFilePath, 'utf-8')
    return JSON.parse(data) as TeamMember[]
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [] // Return empty array if file doesn't exist
    }
    console.error('Error reading members file:', error)
    throw new Error('Failed to read members data')
  }
}

// Helper function to save members to the JSON file
async function saveMembers(members: TeamMember[]): Promise<void> {
  try {
    await fs.writeFile(membersFilePath, JSON.stringify(members, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing members file:', error)
    throw new Error('Failed to save members data')
  }
}

export async function GET(request: Request, { params }: { params: { memberId: string } }) {
  try {
    const members = await getMembers()
    const member = members.find((m) => m.id === params.memberId)

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 })
    }
    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching member', error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { memberId: string } }) {
  try {
    const { name, emoji } = await request.json()
    if (!name && !emoji) {
      return NextResponse.json(
        { message: 'Name or emoji must be provided for update' },
        { status: 400 }
      )
    }

    const members = await getMembers()
    const memberIndex = members.findIndex((m) => m.id === params.memberId)

    if (memberIndex === -1) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 })
    }

    // Update member details
    if (name) members[memberIndex].name = name
    if (emoji) members[memberIndex].emoji = emoji

    await saveMembers(members)
    return NextResponse.json(members[memberIndex])
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating member', error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { memberId: string } }) {
  try {
    let members = await getMembers()
    const initialLength = members.length
    members = members.filter((m) => m.id !== params.memberId)

    if (members.length === initialLength) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 })
    }

    await saveMembers(members)
    return NextResponse.json({ message: 'Member deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error deleting member', error: (error as Error).message },
      { status: 500 }
    )
  }
}
