'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSprintStore } from '~/store/sprintStore'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { SprintFormModal } from '~/components/custom/SprintFormModal'
import { Sprint } from '~/lib/types'
import { format } from 'date-fns'

export default function SprintsPage() {
  const { sprints, fetchSprints, isLoading, error } = useSprintStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchSprints()
  }, [fetchSprints])

  if (isLoading && sprints.length === 0) {
    return <p className='text-center py-10'>Loading sprints...</p>
  }

  if (error) {
    return <p className='text-center py-10 text-red-500'>Error: {error}</p>
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Sprints</h1>
        <SprintFormModal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Button onClick={() => setIsModalOpen(true)}>Create New Sprint</Button>
        </SprintFormModal>
      </div>
      {sprints.length === 0 && !isLoading && (
        <p className='text-center text-gray-500 py-10'>
          No sprints found. Get started by creating one!
        </p>
      )}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {sprints.map((sprint: Sprint) => (
          <Card key={sprint.sprintId}>
            <CardHeader>
              <CardTitle>{sprint.name}</CardTitle>
              <CardDescription>
                {format(new Date(sprint.startDate), 'MMM d, yyyy')} -{' '}
                {format(new Date(sprint.endDate), 'MMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600'>Working Days: {sprint.totalWorkingDays}</p>
              <p className='text-sm text-gray-600'>Team Members: {sprint.teamSnapshot.length}</p>
              {/* TODO: Add more details like overall capacity vs filled capacity once task management is in */}
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Link href={`/sprints/${sprint.sprintId}`} passHref>
                <Button variant='outline'>View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
