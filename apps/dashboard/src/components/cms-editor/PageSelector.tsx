import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  children?: Page[]
}

interface PageSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PageSelector({ 
  value, 
  onChange, 
  placeholder = 'Select a page...',
  disabled,
  className 
}: PageSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customUrl, setCustomUrl] = useState('')

  const { data: pages } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await apiFetch('/pages')
      if (!res.ok) return []
      return res.json() as Promise<Page[]>
    }
  })

  const flattenPages = (pages: Page[], result: Page[] = []): Page[] => {
    for (const page of pages) {
      result.push(page)
      if (page.children?.length) {
        flattenPages(page.children, result)
      }
    }
    return result
  }

  const allPages = flattenPages(pages || [])

  const isExternal = value?.startsWith('http://') || value?.startsWith('https://')
  const isCustom = value && !value.startsWith('/') && !isExternal
  const isPage = value?.startsWith('/')

  const getDisplayValue = () => {
    if (isExternal || isCustom) return 'custom'
    if (isPage) {
      const page = allPages.find(p => `/${p.slug}` === value)
      return page ? `/${page.slug}` : value
    }
    return ''
  }

  const handleSelectPage = (slug: string) => {
    onChange(`/${slug}`)
    setShowCustom(false)
    setCustomUrl('')
  }

  const handleSelectCustom = () => {
    setShowCustom(true)
  }

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url)
    if (url) {
      onChange(url)
    }
  }

  const handleClearCustom = () => {
    setShowCustom(false)
    setCustomUrl('')
    onChange('')
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Select
        value={getDisplayValue()}
        onValueChange={(val) => {
          if (val === 'custom') {
            handleSelectCustom()
          } else if (val.startsWith('/')) {
            handleSelectPage(val.replace('/', ''))
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allPages.map((page) => (
            <SelectItem key={page.id} value={`/${page.slug}`}>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs">/{page.slug}</span>
                <span>-</span>
                <span>{page.title}</span>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="custom">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plus className="h-4 w-4" />
              <span>Enter custom URL</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      {showCustom && (
        <Input
          placeholder="https://example.com"
          value={customUrl || value}
          onChange={(e) => handleCustomUrlChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          autoFocus
        />
      )}
      
      {showCustom && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearCustom}
          className="px-2"
        >
          ×
        </Button>
      )}
    </div>
  )
}
