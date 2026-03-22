import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'

export function useDelete(endpoint: string, queryKey: string[]) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })
}
