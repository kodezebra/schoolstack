import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { QueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export const Route = createFileRoute('/_dashboard')({
  // Ensure queryClient is available in the route context
  // This is implicitly passed from main.tsx context when creating the router
  beforeLoad: async ({ context, location }) => {
    const queryClient = context.queryClient as QueryClient; // Access the QueryClient from context

    try {
      // Use fetchQuery to ensure user data is loaded BEFORE the route proceeds
      const user = await queryClient.fetchQuery({
        queryKey: ['me'],
        queryFn: async () => {
          // Explicitly pass credentials to ensure the HttpOnly cookie is sent
          const res = await apiFetch('/auth/me');
          
          if (res.status === 401 || res.status === 403) {
            // Not authorized, user is null
            return null;
          }
          if (!res.ok) {
            console.error("Error fetching user profile:", res.statusText);
            return null;
          }
          return res.json();
        },
        staleTime: 1000 * 60 * 5, // Keep this for performance, will refetch in background if stale
        retry: false, // Do not retry auth checks if initial fetch fails
      });

      // If user is null after fetching, redirect to login
      if (!user) {
        throw redirect({
          to: '/login',
          search: {
            // Keep track of where the user was trying to go
            redirect: location.href,
          },
        });
      }

      // If user is found, return it to the route context for child routes
      return { user };
    } catch (error) {
      console.error("Authentication check failed:", error);
      // On any error, assume not authenticated and redirect to login
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  // The component just renders the layout now, as authentication is handled in beforeLoad
  component: DashboardLayout,
})
