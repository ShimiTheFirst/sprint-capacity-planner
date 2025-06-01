// Filepath: /Users/martin/Documents/Projects/digital-solutions/misc/sprint-capacity-planner/src/app/(app)/team-members/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
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
import { MemberFormModal } from '~/components/custom/MemberFormModal'
import { useMemberStore } from '~/store/memberStore'
import { TeamMember } from '~/lib/types'

export default function TeamMembersPage() {
  const { members, isLoading, error, fetchMembers, removeMember } = useMemberStore((state) => state)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleRemoveClick = (member: TeamMember) => {
    setMemberToRemove(member)
  }

  const handleConfirmRemove = async () => {
    if (memberToRemove) {
      await removeMember(memberToRemove.id)
      setMemberToRemove(null)
      // The store already refetches, so no need to call fetchMembers() here explicitly
    }
  }

  if (isLoading && members.length === 0) {
    return <div className='container mx-auto p-4'>Loading team members...</div>
  }

  if (error) {
    return <div className='container mx-auto p-4 text-red-500'>Error: {error}</div>
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>Team Members</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Member</Button>
      </div>

      {members.length === 0 && !isLoading ? (
        <p>No team members found. Add some to get started!</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Emoji</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className='text-right w-[150px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className='text-2xl'>{member.emoji}</TableCell>
                <TableCell className='font-medium'>{member.name}</TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleRemoveClick(member)}
                    disabled={isLoading} // Disable if any store operation is in progress
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <MemberFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onMemberAdded={() => {
          // Optional: could add a success notification here
          // fetchMembers(); // Store already refetches
        }}
      />

      {memberToRemove && (
        <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                <span className='font-semibold'>
                  {' '}
                  {memberToRemove.emoji} {memberToRemove.name}
                </span>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setMemberToRemove(null)} disabled={isLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRemove} disabled={isLoading}>
                {isLoading ? 'Removing...' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
