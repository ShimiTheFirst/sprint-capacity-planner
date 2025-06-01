'use client'

import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { useSprintStore } from '~/store/sprintStore'
import { CalendarIcon } from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
import { Sprint } from '~/lib/types'

interface SprintFormModalProps {
  children: React.ReactNode
  sprint?: Sprint // Optional: for editing existing sprint
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

export function SprintFormModal({
  children,
  sprint,
  onOpenChange,
  open: controlledOpen,
}: SprintFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [sprintName, setSprintName] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [error, setError] = useState<string | null>(null)

  const createSprint = useSprintStore((state) => state.createSprint)
  // const updateSprint = useSprintStore((state) => state.updateSprint); // TODO: Implement if editing is needed
  const isLoading = useSprintStore((state) => state.isLoading)

  const isEditing = !!sprint

  const currentOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setCurrentOpen =
    controlledOpen !== undefined && onOpenChange ? onOpenChange : setInternalOpen

  useEffect(() => {
    if (isEditing && sprint) {
      setSprintName(sprint.name)
      // Ensure dates are parsed correctly from ISO strings
      const parsedStartDate = sprint.startDate ? parseISO(sprint.startDate) : undefined
      const parsedEndDate = sprint.endDate ? parseISO(sprint.endDate) : undefined
      setStartDate(isValid(parsedStartDate) ? parsedStartDate : undefined)
      setEndDate(isValid(parsedEndDate) ? parsedEndDate : undefined)
    } else {
      // Reset form for new sprint
      setSprintName('')
      setStartDate(undefined)
      setEndDate(undefined)
    }
    setError(null)
  }, [isEditing, sprint, currentOpen])

  const handleSubmit = async () => {
    setError(null)
    if (!sprintName.trim()) {
      setError('Sprint name is required.')
      return
    }
    if (!startDate) {
      setError('Start date is required.')
      return
    }
    if (!endDate) {
      setError('End date is required.')
      return
    }
    if (endDate < startDate) {
      setError('End date cannot be before start date.')
      return
    }

    const sprintData = {
      name: sprintName.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }

    try {
      if (isEditing && sprint?.sprintId) {
        // await updateSprint(sprint.sprintId, sprintData); // TODO: Implement update functionality
        console.log('Update sprint:', sprint.sprintId, sprintData) // Placeholder
      } else {
        await createSprint(sprintData)
      }
      setCurrentOpen(false)
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save sprint.')
    }
  }

  return (
    <Dialog open={currentOpen} onOpenChange={setCurrentOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Sprint' : 'Create New Sprint'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your sprint.'
              : 'Fill in the details for the new sprint.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='sprintName' className='text-right'>
              Name
            </Label>
            <Input
              id='sprintName'
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              className='col-span-3'
              placeholder='e.g., May Sprint Week 1'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='startDate' className='text-right'>
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={`col-span-3 justify-start text-left font-normal ${
                    !startDate && 'text-muted-foreground'
                  }`}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar mode='single' selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='endDate' className='text-right'>
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={`col-span-3 justify-start text-left font-normal ${
                    !endDate && 'text-muted-foreground'
                  }`}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => (startDate ? date < startDate : false)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {error && <p className='col-span-4 text-sm text-red-500 text-center'>{error}</p>}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setCurrentOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
              ? 'Save Changes'
              : 'Create Sprint'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
