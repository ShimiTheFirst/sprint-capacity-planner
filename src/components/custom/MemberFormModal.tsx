// Filepath: /Users/martin/Documents/Projects/digital-solutions/misc/sprint-capacity-planner/src/components/custom/MemberFormModal.tsx
'use client'

import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useMemberStore } from '~/store/memberStore'

interface MemberFormModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onMemberAdded?: () => void // Optional: Callback after member is added
}

export function MemberFormModal({ isOpen, onOpenChange, onMemberAdded }: MemberFormModalProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [error, setError] = useState('')
  const addMember = useMemberStore((state) => state.addMember)
  const isLoading = useMemberStore((state) => state.isLoading)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !emoji.trim()) {
      setError('Name and emoji cannot be empty.')
      return
    }

    // Basic emoji validation (optional, can be improved)
    // This regex checks if the string contains at least one emoji character.
    // It might not be perfect for all emoji sequences (like skin tone modifiers, flags etc.)
    // but is a decent starting point.
    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u
    if (!emojiRegex.test(emoji)) {
      setError('Please enter a valid emoji.')
      return
    }
    if (emoji.length > 2 && !emojiRegex.test(emoji.substring(0, 2))) {
      // crude check for multiple characters that are not a single emoji
      setError('Please enter a single valid emoji.')
      return
    }

    const newMember = await addMember(name, emoji)
    if (newMember) {
      setName('')
      setEmoji('')
      onOpenChange(false) // Close the modal
      if (onMemberAdded) {
        onMemberAdded()
      }
    } else {
      // Error is handled by the store and can be displayed if needed
      // For now, we rely on the store's error state for global error display
      // or add a specific error message here if preferred.
      setError('Failed to add member. Please try again.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
          <DialogDescription>
            Enter the name and select an emoji for the new team member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='col-span-3'
                placeholder='Alice Wonderland'
                disabled={isLoading}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='emoji' className='text-right'>
                Emoji
              </Label>
              <Input
                id='emoji'
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className='col-span-3'
                placeholder='👩‍💻'
                maxLength={2} // Basic length check, actual emoji length can vary
                disabled={isLoading}
              />
            </div>
            {error && <p className='col-span-4 text-sm text-red-500 text-center'>{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
