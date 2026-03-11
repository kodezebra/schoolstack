import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/websites')({
  component: () => <div className="p-4"><h1 className="text-2xl font-bold">Websites</h1><p className="text-muted-foreground mt-2">Manage your domains and site configurations.</p></div>,
})
