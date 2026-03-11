import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/security')({
  component: () => <div className="p-4"><h1 className="text-2xl font-bold">Security</h1><p className="text-muted-foreground mt-2">Configure firewall, DDoS protection, and SSL settings.</p></div>,
})
