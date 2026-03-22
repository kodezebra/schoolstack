import { useState } from "react"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HelpModal } from "./help-modal"

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        size="icon"
        variant="default"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="sr-only">Open Help</span>
      </Button>

      <HelpModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
