import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/settings')({
  component: () => <div className="p-4"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground mt-2">Update your profile, billing, and global configuration.</p></div>,
})
