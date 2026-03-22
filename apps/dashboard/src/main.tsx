import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ToastProvider } from "@/components/ui/toast"

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new query client
const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({ 
  routeTree,
  context: {
    queryClient
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
    routerContext: {
      queryClient: QueryClient
    }
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <RouterProvider router={router} context={{ queryClient }} />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
