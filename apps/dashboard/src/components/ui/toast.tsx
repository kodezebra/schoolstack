import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'default'
}

interface ToastContextType {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { ...props, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ 
  toasts, 
  onDismiss 
}: { 
  toasts: Toast[]
  onDismiss: (id: string) => void 
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right',
            toast.variant === 'success' && 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
            toast.variant === 'error' && 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
            toast.variant === 'default' && 'bg-background border-border'
          )}
        >
          {toast.variant === 'success' && (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          )}
          {toast.variant === 'error' && (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium',
              toast.variant === 'success' && 'text-green-800 dark:text-green-200',
              toast.variant === 'error' && 'text-red-800 dark:text-red-200',
              toast.variant === 'default' && 'text-foreground'
            )}>
              {toast.title}
            </p>
            {toast.description && (
              <p className={cn(
                'text-xs mt-1',
                toast.variant === 'success' && 'text-green-700 dark:text-green-300',
                toast.variant === 'error' && 'text-red-700 dark:text-red-300',
                toast.variant === 'default' && 'text-muted-foreground'
              )}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className={cn(
              'shrink-0 p-1 rounded hover:bg-black/10 transition-colors',
              toast.variant === 'success' && 'text-green-600 hover:text-green-800',
              toast.variant === 'error' && 'text-red-600 hover:text-red-800',
              toast.variant === 'default' && 'text-muted-foreground hover:text-foreground'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
