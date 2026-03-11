import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/users')({
  component: () => <div className="p-4"><h1 className="text-2xl font-bold">Users</h1><p className="text-muted-foreground mt-2">Manage team members and their permissions.</p></div>,
})
