import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/performance')({
  component: () => <div className="p-4"><h1 className="text-2xl font-bold">Performance</h1><p className="text-muted-foreground mt-2">Optimize caching, image delivery, and minification.</p></div>,
})
