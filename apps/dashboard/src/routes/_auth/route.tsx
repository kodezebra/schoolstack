import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  ),
})
