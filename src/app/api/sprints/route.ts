// Filepath: /Users/martin/Documents/Projects/digital-solutions/misc/sprint-capacity-planner/src/app/api/sprints/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Sprint, TeamMember, MemberCapacity } from '~/lib/types';
import { calculateWorkingDays } from '~/lib/utils';

const dataDir = path.join(process.cwd(), 'data');
const membersFilePath = path.join(dataDir, 'members.json');

async function getCurrentMembers(): Promise<TeamMember[]> {
  try {
    const data = await fs.readFile(membersFilePath, 'utf-8');
    return JSON.parse(data) as TeamMember[];
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // No members file found, treat as empty
    }
    console.error('Error reading members file for sprint creation:', error);
    throw new Error('Failed to read members data for sprint');
  }
}

export async function GET() {
  try {
    const files = await fs.readdir(dataDir);
    const sprintFiles = files.filter(file => file.startsWith('sprint-') && file.endsWith('.json'));

    if (sprintFiles.length === 0) {
      return NextResponse.json([]);
    }

    const sprints: Sprint[] = [];
    for (const sprintFile of sprintFiles) {
      const filePath = path.join(dataDir, sprintFile);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      sprints.push(JSON.parse(fileContent) as Sprint);
    }

    // Optionally sort sprints, e.g., by startDate descending
    sprints.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return NextResponse.json(sprints);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching sprints', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, startDate, endDate } = await request.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ message: 'Name, startDate, and endDate are required' }, { status: 400 });
    }

    // Validate date format if necessary (e.g., using a regex or date library)

    const sprintId = `sprint-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const totalWorkingDays = calculateWorkingDays(startDate, endDate);

    if (totalWorkingDays <= 0 && startDate !== endDate) { // Allow 0 if start and end are same day but it's a weekend
        if (new Date(startDate).getDay() % 6 !== 0 || new Date(endDate).getDay() % 6 !== 0 ) {
             if (startDate === endDate && calculateWorkingDays(startDate, endDate) === 0) {
                // This is fine, it's a single weekend day sprint, or a single day sprint on a weekend.
             } else {
                return NextResponse.json({ message: 'End date must be after start date, resulting in at least one working day, or it must be a valid single day sprint.' }, { status: 400 });
             }
        }
    }


    const currentMembers = await getCurrentMembers();
    const teamSnapshot: MemberCapacity[] = currentMembers.map(member => ({
      memberId: member.id,
      name: member.name,
      emoji: member.emoji,
      maxCapacity: totalWorkingDays * 8,
      filledCapacity: 0,
      tasks: [],
    }));

    const newSprint: Sprint = {
      sprintId,
      name,
      startDate,
      endDate,
      totalWorkingDays,
      teamSnapshot,
    };

    const sprintFilePath = path.join(dataDir, `${sprintId}.json`);
    await fs.writeFile(sprintFilePath, JSON.stringify(newSprint, null, 2), 'utf-8');

    return NextResponse.json(newSprint, { status: 201 });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return NextResponse.json({ message: 'Error creating sprint', error: (error as Error).message }, { status: 500 });
  }
}
