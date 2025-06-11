'use client'

import * as React from 'react'
import { Button } from '~/components/ui/button'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle(): React.ReactElement {
  const { theme, setTheme } = useTheme()

  // Toggle theme function
  const toggleTheme = (): void => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="transition-all duration-300"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </Button>
  )
}
