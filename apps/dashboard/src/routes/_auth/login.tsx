import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react'

import { apiFetch } from '@/lib/api'

export const Route = createFileRoute('/_auth/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Invalid credentials')
      return res.json()
    },
    onSuccess: () => {
      // Refresh the "me" query so the whole app knows we are logged in
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate({ to: '/' })
    },
    onError: () => {
      setError('Invalid email or password')
    }
  })

  return (
    <div className="grid gap-6 p-6 bg-card rounded-xl border shadow-sm">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the CMS
        </p>
      </div>
      <form 
        className="grid gap-4" 
        onSubmit={(e) => {
          e.preventDefault()
          loginMutation.mutate()
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Need access? Contact your school administrator.
      </div>
    </div>
  )
}