'use client'

import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '~/components/ui/navigation-menu'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/team-members', label: 'Team Members' },
    { href: '/sprints', label: 'Sprints' },
    { href: '/current-sprint', label: 'Current Sprint' },
  ]

  return (
    <nav className="flex items-center justify-between mb-6" aria-label="Main navigation">
      <NavigationMenu>
        <NavigationMenuList>
          {navItems.map((item) => (
            <NavigationMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  active={
                    pathname === item.href ||
                    (item.href === '/sprints' && pathname.startsWith('/sprints/'))
                  }
                >
                  {item.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <ThemeToggle />
    </div>
  )
}
