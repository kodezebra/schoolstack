import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from '@iconify/react'
import { Section, Field, ItemAccordion } from '../common'
import { Switch } from "@/components/ui/switch"

export function PricingInspector({
  content,
  onUpdateContent,
  openItem,
  onToggleItem
}: {
  content: any,
  onUpdateContent: (c: any) => void,
  openItem: number | null,
  onToggleItem: (i: number) => void
}) {
  const updateTier = (index: number, value: any) => {
    const newTiers = [...(content.tiers || [])]
    newTiers[index] = { ...newTiers[index], ...value }
    onUpdateContent({ ...content, tiers: newTiers })
  }

  const addTier = () => {
    const newTier = {
      name: 'New Plan',
      description: 'Plan description',
      price: '0',
      currency: '$',
      period: 'month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      ctaLabel: 'Get Started',
      ctaHref: '#',
      recommended: false,
    }
    const newTiers = [...(content.tiers || []), newTier]
    onUpdateContent({ ...content, tiers: newTiers })
    onToggleItem(newTiers.length - 1)
  }

  const removeTier = (index: number) => {
    const newTiers = content.tiers.filter((_: any, i: number) => i !== index)
    onUpdateContent({ ...content, tiers: newTiers })
  }

  const updateFeature = (tierIndex: number, featureIndex: number, value: string) => {
    const newTiers = [...content.tiers]
    const newFeatures = [...newTiers[tierIndex].features]
    newFeatures[featureIndex] = value
    newTiers[tierIndex].features = newFeatures
    onUpdateContent({ ...content, tiers: newTiers })
  }

  const addFeature = (tierIndex: number) => {
    const newTiers = [...content.tiers]
    newTiers[tierIndex].features = [...(newTiers[tierIndex].features || []), 'New feature']
    onUpdateContent({ ...content, tiers: newTiers })
  }

  const removeFeature = (tierIndex: number, featureIndex: number) => {
    const newTiers = [...content.tiers]
    newTiers[tierIndex].features = newTiers[tierIndex].features.filter((_: any, i: number) => i !== featureIndex)
    onUpdateContent({ ...content, tiers: newTiers })
  }

  return (
    <>
      <Section title="Header Content">
        <Field label="Tagline"><Input value={content.tagline || ''} onChange={(e) => onUpdateContent({ ...content, tagline: e.target.value })} /></Field>
        <Field label="Title"><Input value={content.title || ''} onChange={(e) => onUpdateContent({ ...content, title: e.target.value })} /></Field>
        <Field label="Subtitle"><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm" value={content.subtitle || ''} onChange={(e) => onUpdateContent({ ...content, subtitle: e.target.value })} /></Field>
        <Field label="Billing Cycle">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={content.billingCycle || ''}
            onChange={(e) => onUpdateContent({ ...content, billingCycle: e.target.value })}
          >
            <option value="">None</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </Field>
      </Section>
      <Section title="Pricing Tiers">
        <div className="space-y-4">
          {content.tiers?.map((tier: any, i: number) => (
            <ItemAccordion
              key={i}
              title={tier.name || `Tier ${i + 1}`}
              onRemove={() => removeTier(i)}
              isOpen={openItem === i}
              onToggle={() => onToggleItem(i)}
            >
              <div className="space-y-3">
                <Field label="Plan Name"><Input value={tier.name || ''} onChange={(e) => updateTier(i, { name: e.target.value })} /></Field>
                <Field label="Description"><Input value={tier.description || ''} onChange={(e) => updateTier(i, { description: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Price"><Input type="number" value={tier.price || ''} onChange={(e) => updateTier(i, { price: e.target.value })} /></Field>
                  <Field label="Currency"><Input value={tier.currency || '$'} onChange={(e) => updateTier(i, { currency: e.target.value })} /></Field>
                </div>
                <Field label="Period"><Input value={tier.period || 'month'} onChange={(e) => updateTier(i, { period: e.target.value })} /></Field>
                <Field label="CTA Label"><Input value={tier.ctaLabel || ''} onChange={(e) => updateTier(i, { ctaLabel: e.target.value })} /></Field>
                <Field label="CTA URL"><Input value={tier.ctaHref || '#'} onChange={(e) => updateTier(i, { ctaHref: e.target.value })} /></Field>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Recommended</label>
                  <Switch
                    checked={tier.recommended || false}
                    onCheckedChange={(checked) => updateTier(i, { recommended: checked })}
                  />
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-xs font-medium">Features</label>
                  {tier.features?.map((feature: string, j: number) => (
                    <div key={j} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(i, j, e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeFeature(i, j)}>
                        <Icon icon="ph:trash-fill" className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => addFeature(i)}>
                    <Icon icon="ph:plus-fill" className="h-3 w-3 mr-1" /> Add Feature
                  </Button>
                </div>
              </div>
            </ItemAccordion>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={addTier}>
            <Icon icon="ph:plus-fill" className="h-3 w-3" /> Add Pricing Tier
          </Button>
        </div>
      </Section>
    </>
  )
}
