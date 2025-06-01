'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSprintStore } from '~/store/sprintStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import { format } from 'date-fns'
import { TaskFormModal } from '~/components/custom/TaskFormModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import type { Task } from '~/lib/types'

export default function SprintDetailPage() {
  const params = useParams()
  const sprintId = params.sprintId as string

  const { activeSprintDetail, fetchSprintById, isLoading, error, removeTask } = useSprintStore()

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskModalMode, setTaskModalMode] = useState<'add' | 'edit'>('add')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [memberForTaskDeletion, setMemberForTaskDeletion] = useState<string | null>(null)

  useEffect(() => {
    if (sprintId) {
      fetchSprintById(sprintId)
    }
  }, [sprintId, fetchSprintById])

  if (isLoading) {
    return <p>Loading sprint details...</p>
  }

  if (error) {
    return <p>Error loading sprint: {error}</p>
  }

  if (!activeSprintDetail) {
    return <p>Sprint not found.</p>
  }

  const { name, startDate, endDate, totalWorkingDays, teamSnapshot } = activeSprintDetail

  const handleOpenTaskModal = (
    mode: 'add' | 'edit',
    memberId: string,
    task: Task | null = null
  ) => {
    setTaskModalMode(mode)
    setSelectedMemberId(memberId)
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  const handleCloseTaskModalCleanup = () => {
    setSelectedTask(null)
    setSelectedMemberId(null)
  }

  const handleOpenDeleteAlert = (task: Task, memberId: string) => {
    setTaskToDelete(task)
    setMemberForTaskDeletion(memberId)
    setIsDeleteAlertOpen(true)
  }

  const handleCloseDeleteAlert = () => {
    setIsDeleteAlertOpen(false)
    setTaskToDelete(null)
    setMemberForTaskDeletion(null)
  }

  const handleConfirmDelete = async () => {
    if (taskToDelete && memberForTaskDeletion && activeSprintDetail) {
      await removeTask(activeSprintDetail.sprintId, taskToDelete.taskId, memberForTaskDeletion)
    }
    handleCloseDeleteAlert()
  }

  return (
    <div className='container mx-auto p-4'>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-2xl'>{name}</CardTitle>
          <CardDescription>
            {format(new Date(startDate), 'PPP')} - {format(new Date(endDate), 'PPP')} (
            {totalWorkingDays} working days)
          </CardDescription>
        </CardHeader>
      </Card>

      <h2 className='text-xl font-semibold mb-4'>Team Capacity & Tasks</h2>
      {teamSnapshot.map((member) => {
        const memberTasks = member.tasks // Tasks are directly available on the member object within teamSnapshot
        const filledCapacity = member.filledCapacity // Use pre-calculated filledCapacity
        const totalCapacity = member.maxCapacity // Use pre-calculated maxCapacity
        const capacityPercentage = totalCapacity > 0 ? (filledCapacity / totalCapacity) * 100 : 0

        return (
          <Card key={member.memberId} className='mb-4'>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle>
                  {member.emoji} {member.name}
                </CardTitle>
                <span className='text-sm text-muted-foreground'>
                  {totalCapacity > 0 ? Math.round((filledCapacity / totalCapacity) * 100) : 0} %
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={capacityPercentage} className='mb-3 h-3' />
              <h4 className='font-semibold mb-2'>Tasks:</h4>
              {memberTasks.length > 0 ? (
                <ul className='list-disc pl-5 space-y-1'>
                  {memberTasks.map((task) => (
                    <li key={task.taskId} className='text-sm flex items-center'>
                      <span className='min-w-20'>[{task.clientName}]</span>
                      <span>
                        {task.description} - {task.time}h
                      </span>
                      <div className='ml-auto'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='ml-2'
                          onClick={() => handleOpenTaskModal('edit', member.memberId, task)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          className='ml-1'
                          onClick={() => handleOpenDeleteAlert(task, member.memberId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-muted-foreground'>No tasks assigned yet.</p>
              )}
              <Button
                size='sm'
                className='mt-3'
                onClick={() => handleOpenTaskModal('add', member.memberId)}
              >
                Add Task
              </Button>
            </CardContent>
          </Card>
        )
      })}

      {selectedMemberId && activeSprintDetail && (
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onOpenChange={(open) => {
            setIsTaskModalOpen(open)
            if (!open) {
              handleCloseTaskModalCleanup()
            }
          }}
          sprintId={activeSprintDetail.sprintId}
          memberId={selectedMemberId}
          task={taskModalMode === 'edit' ? selectedTask : null} // Corrected prop name to 'task'
        />
      )}

      {taskToDelete && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                Task: &quot;{taskToDelete.description}&quot; ({taskToDelete.time}h). This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCloseDeleteAlert}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
