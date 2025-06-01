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
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useSprintStore } from '~/store/sprintStore'
import { Task } from '~/lib/types'

interface TaskFormModalProps {
  sprintId: string
  memberId: string
  task?: Task | null // Existing task for editing, null/undefined for new task
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode // For the trigger button
}

export function TaskFormModal({
  sprintId,
  memberId,
  task,
  isOpen,
  onOpenChange,
  children,
}: TaskFormModalProps) {
  const [description, setDescription] = useState('')
  const [clientName, setClientName] = useState('')
  const [time, setTime] = useState<number | string>('')

  const { addTask, updateTask, isLoading, error } = useSprintStore()

  const isEditing = !!task

  useEffect(() => {
    if (task && isOpen) {
      setDescription(task.description)
      setClientName(task.clientName)
      setTime(task.time)
    } else if (!isOpen) {
      // Reset form when modal is closed or if it's for a new task
      setDescription('')
      setClientName('')
      setTime('')
    }
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const numericTime = parseFloat(time as string)
    if (isNaN(numericTime) || numericTime <= 0) {
      // Basic validation, consider more robust validation (e.g., Zod)
      alert('Please enter a valid time (positive number).')
      return
    }

    if (isEditing && task) {
      await updateTask({
        sprintId,
        taskId: task.taskId,
        description,
        clientName,
        time: numericTime,
      })
    } else {
      await addTask({
        sprintId,
        memberId,
        description,
        clientName,
        time: numericTime,
      })
    }

    if (!error && !isLoading) {
      onOpenChange(false) // Close modal on success
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of the task.'
              : 'Fill in the details for the new task.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='description' className='text-right'>
              Description
            </Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='col-span-3'
              required
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='clientName' className='text-right'>
              Client Name
            </Label>
            <Input
              id='clientName'
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className='col-span-3'
              required
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='time' className='text-right'>
              Time (hours)
            </Label>
            <Input
              id='time'
              type='number'
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className='col-span-3'
              required
              min='0.5'
              step='0.5'
            />
          </div>
          {error && <p className='text-sm text-red-500 col-span-4'>Error: {error}</p>}
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading
                ? isEditing
                  ? 'Saving...'
                  : 'Adding...'
                : isEditing
                ? 'Save Changes'
                : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
