'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSprintStore } from '~/store/sprintStore'
import { Button } from '~/components/ui/button'
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export default function CurrentSprintPage() {
  const router = useRouter()
  const { sprints, fetchSprints, isLoading, error } = useSprintStore()
  const [checkedSprints, setCheckedSprints] = useState(false)

  useEffect(() => {
    fetchSprints()
  }, [fetchSprints])

  useEffect(() => {
    if (sprints.length > 0 && !isLoading && !error) {
      const today = new Date()
      const todayStart = startOfDay(today)

      const activeSprint = sprints.find((sprint) => {
        try {
          const startDate = startOfDay(parseISO(sprint.startDate))
          const endDate = endOfDay(parseISO(sprint.endDate)) // Use endOfDay for inclusivity
          return isWithinInterval(todayStart, { start: startDate, end: endDate })
        } catch (e) {
          console.error('Error parsing sprint dates:', e)
          return false
        }
      })

      if (activeSprint) {
        router.replace(`/sprints/${activeSprint.sprintId}`)
      } else {
        setCheckedSprints(true) // Mark that we've checked and found no active sprint
      }
    }
    // If sprints array is empty after fetch, also mark as checked
    if (!isLoading && sprints.length === 0 && !error) {
      setCheckedSprints(true)
    }
  }, [sprints, isLoading, error, router])

  if (isLoading || (!checkedSprints && sprints.length === 0 && !error)) {
    // Show loading if actively loading OR if we haven't checked sprints yet (initial load)
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-lg text-muted-foreground'>
          Loading sprints and determining current sprint...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-red-500'>Failed to load sprints: {error}</p>
          <Button asChild className='mt-4'>
            <Link href='/sprints'>Go to Sprints Page</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // This content is shown only if checkedSprints is true and no active sprint was found (and no redirect happened)
  if (checkedSprints) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle>No Active Sprint</CardTitle>
          <CardDescription>
            There is no sprint currently active based on the system date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='mb-4'>You can view upcoming sprints or create a new one.</p>
          <Button asChild>
            <Link href='/sprints'>Go to Sprints Page</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Fallback for any state not explicitly handled, though ideally covered by isLoading or checkedSprints logic
  return (
    <div className='flex justify-center items-center h-64'>
      <p className='text-lg text-muted-foreground'>Checking for active sprint...</p>
    </div>
  )
}
