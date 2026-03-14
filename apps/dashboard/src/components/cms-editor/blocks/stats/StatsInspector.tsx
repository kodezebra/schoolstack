import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from 'lucide-react'
import { Section, Field } from '../common'

// Inspector to manage numeric stats items
export function StatsInspector({ content, onUpdateContent }: { content: any, onUpdateContent: (c: any) => void }) {
  const updateItem = (key: string, index: number, value: any) => {
    const newItems = [...(content[key] || [])]
    newItems[index] = { ...newItems[index], ...value }
    onUpdateContent({ ...content, [key]: newItems })
  }

  const addItem = (key: string, defaultValue: any) => {
    const newItems = [...(content[key] || []), defaultValue]
    onUpdateContent({ ...content, [key]: newItems })
  }

  const removeItem = (key: string, index: number) => {
    const newItems = content[key].filter((_: any, i: number) => i !== index)
    onUpdateContent({ ...content, [key]: newItems })
  }

  return (
    <Section title="Statistics">
      <div className="space-y-2">
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="p-3 border rounded-lg space-y-3 relative group">
            <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => removeItem('items', i)}>
              <X className="h-3 w-3" />
            </Button>
            <Field label="Value"><Input value={item.value || ''} onChange={(e) => updateItem('items', i, { value: e.target.value })} placeholder="500+" /></Field>
            <Field label="Label"><Input value={item.label || ''} onChange={(e) => updateItem('items', i, { label: e.target.value })} placeholder="Users" /></Field>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => addItem('items', { value: '0', label: 'New Stat' })}>
          <Plus className="h-3 w-3" /> Add Stat
        </Button>
      </div>
    </Section>
  )
}
