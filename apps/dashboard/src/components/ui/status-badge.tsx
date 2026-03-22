import { Badge } from './badge'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-700',
  closed: 'bg-red-100 text-red-700',
  upcoming: 'bg-blue-100 text-blue-700',
  transferred: 'bg-orange-100 text-orange-700',
  graduated: 'bg-purple-100 text-purple-700',
  withdrawn: 'bg-red-100 text-red-700',
  submitted: 'bg-blue-100 text-blue-700',
  read: 'bg-gray-100 text-gray-700',
  replied: 'bg-green-100 text-green-700',
  cash: 'bg-green-100 text-green-700',
  mobile_money: 'bg-blue-100 text-blue-700',
  bank: 'bg-purple-100 text-purple-700',
  school_pay: 'bg-amber-100 text-amber-700',
  owner: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  teacher: 'bg-green-100 text-green-700',
  counselor: 'bg-teal-100 text-teal-700',
  principal: 'bg-amber-100 text-amber-700',
  test: 'bg-gray-100 text-gray-700',
  midterm: 'bg-blue-100 text-blue-700',
  final: 'bg-purple-100 text-purple-700',
  assignment: 'bg-green-100 text-green-700',
  quiz: 'bg-amber-100 text-amber-700',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

interface RoleBadgeProps {
  role: string
  className?: string
}

interface ExamTypeBadgeProps {
  type: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-700'
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')

  return (
    <Badge className={`${colorClass} ${className || ''}`}>
      {label}
    </Badge>
  )
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return StatusBadge({ status: role, className })
}

export function ExamTypeBadge({ type, className }: ExamTypeBadgeProps) {
  return StatusBadge({ status: type, className })
}
