import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, type ReactNode } from "react"

interface ConfirmOptions {
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}) {
  if (!open) return null
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useConfirmDialog() {
  const [dialogConfig, setDialogConfig] = useState<ConfirmOptions | null>(null)

  const confirm = (options: ConfirmOptions) => {
    setDialogConfig(options)
  }

  const close = () => {
    setDialogConfig(null)
  }

  const renderConfirmDialog = (): ReactNode => {
    if (!dialogConfig) return null
    return (
      <ConfirmDialog
        open={true}
        onClose={close}
        title={dialogConfig.title}
        description={dialogConfig.description}
        onConfirm={dialogConfig.onConfirm}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        variant={dialogConfig.variant}
      />
    )
  }

  return {
    confirm,
    close,
    renderConfirmDialog,
  }
}
