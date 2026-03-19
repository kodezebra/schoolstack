import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStatProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo'
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  onClick?: () => void
}

const colorVariants = {
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    icon: 'text-green-600 dark:text-green-400'
  },
  purple: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  pink: {
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    icon: 'text-pink-600 dark:text-pink-400'
  },
  indigo: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    icon: 'text-indigo-600 dark:text-indigo-400'
  }
}

export function DashboardStat({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
  trend,
  onClick
}: DashboardStatProps) {
  const variant = colorVariants[color]

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-xl border bg-card hover:shadow-md transition-all',
        onClick && 'cursor-pointer hover:border-primary/50'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.positive ? 'text-green-600' : 'text-red-600'
            )}>
              <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', variant.iconBg)}>
          <Icon className={cn('h-5 w-5', variant.icon)} />
        </div>
      </div>
    </div>
  )
}
