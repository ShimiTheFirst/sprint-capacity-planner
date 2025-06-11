import * as React from 'react'

// Set the initial theme before rendering to avoid flash of incorrect theme
export function ThemeScript(): React.ReactElement {
  const codeToRunOnClient = `
    (function() {
      // Get stored theme or use system preference
      let theme = window.localStorage.getItem('theme')
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      
      // If no saved theme, use system preference
      if (!theme) {
        theme = systemPreference
      }
      
      // Apply theme by adding class to document
      document.documentElement.classList.add(theme)
    })()
  `

  // Using dangerouslySetInnerHTML for this specific use case is acceptable
  // as we're not using any user-provided input
  return (
    <script
      dangerouslySetInnerHTML={{ __html: codeToRunOnClient }}
    />
  )
}
