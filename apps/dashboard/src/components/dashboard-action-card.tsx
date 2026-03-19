import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardActionCardProps {
  to: string
  title: string
  description: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo'
  badge?: string | number
  shortcut?: string
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'hover:border-blue-300 dark:hover:border-blue-700',
    badge: 'bg-blue-500'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    icon: 'text-green-600 dark:text-green-400',
    border: 'hover:border-green-300 dark:hover:border-green-700',
    badge: 'bg-green-500'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'hover:border-purple-300 dark:hover:border-purple-700',
    badge: 'bg-purple-500'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    icon: 'text-orange-600 dark:text-orange-400',
    border: 'hover:border-orange-300 dark:hover:border-orange-700',
    badge: 'bg-orange-500'
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    icon: 'text-pink-600 dark:text-pink-400',
    border: 'hover:border-pink-300 dark:hover:border-pink-700',
    badge: 'bg-pink-500'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    icon: 'text-indigo-600 dark:text-indigo-400',
    border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    badge: 'bg-indigo-500'
  }
}

export function DashboardActionCard({
  to,
  title,
  description,
  icon: Icon,
  color = 'blue',
  badge,
  shortcut
}: DashboardActionCardProps) {
  const variant = colorVariants[color]

  return (
    <Link
      to={to}
      className={cn(
        'group block p-5 rounded-xl border bg-card hover:shadow-lg transition-all duration-200',
        variant.border
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn('p-2.5 rounded-lg', variant.iconBg)}>
            <Icon className={cn('h-5 w-5', variant.icon)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-card-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {badge !== undefined && badge !== null && (
            <span className={cn(
              'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white',
              variant.badge
            )}>
              {badge}
            </span>
          )}
          {shortcut && (
            <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              {shortcut}
            </kbd>
          )}
        </div>
      </div>
    </Link>
  )
}
