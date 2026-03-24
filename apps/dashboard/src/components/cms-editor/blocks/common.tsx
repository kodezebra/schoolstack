import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'

// Simple helper components for block inspectors to maintain layout consistency

export const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">{title}</h3>
    {children}
  </div>
)

export const Field = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="grid gap-2">
    <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">{label}</Label>
    {children}
  </div>
)

export const ItemAccordion = ({ 
  title, 
  onRemove, 
  children,
  isOpen,
  onToggle
}: { 
  title: string, 
  onRemove: () => void, 
  children: React.ReactNode,
  isOpen: boolean,
  onToggle: () => void
}) => (
  <div className="border rounded-lg bg-muted/30 overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-pointer" onClick={onToggle}>
      <span className="text-[10px] font-bold truncate uppercase">{title}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <Icon icon="ph:x-fill" className="h-3 w-3 text-destructive" />
        </Button>
        {isOpen ? <Icon icon="ph:caret-up-fill" className="h-3 w-3" /> : <Icon icon="ph:caret-down-fill" className="h-3 w-3" />}
      </div>
    </div>
    {isOpen && <div className="p-3 space-y-3 border-t bg-background">{children}</div>}
  </div>
)
