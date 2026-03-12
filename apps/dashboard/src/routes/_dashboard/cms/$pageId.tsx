import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { cn } from "@/lib/utils"

// New Editor Refactored Components
import { EditorSidebar } from '@/components/cms-editor/EditorSidebar'
import { EditorCanvas } from '@/components/cms-editor/EditorCanvas'
import { EditorInspector } from '@/components/cms-editor/EditorInspector'
import { EditorHeader } from '@/components/cms-editor/EditorHeader'
import { useEditor } from '@/components/cms-editor/useEditor'

export const Route = createFileRoute('/_dashboard/cms/$pageId')({
  component: CMSPage,
})

function CMSPage() {
  const { pageId } = Route.useParams()
  const queryClient = useQueryClient()
  
  // 1. Data Fetching
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      const res = await apiFetch(`/pages/${pageId}`)
      return res.json()
    }
  })

  // 2. Editor Hook
  const editor = useEditor(pageData?.blocks)

  // 3. Settings State (Separate from Blocks)
  const [settings, setSettings] = useState({
    title: '', slug: '', description: '', status: 'draft',
    metaTitle: '', metaDescription: ''
  })

  useEffect(() => {
    if (pageData) {
      setSettings({
        title: pageData.title || '',
        slug: pageData.slug || '',
        description: pageData.description || '',
        status: pageData.status || 'draft',
        metaTitle: pageData.metaTitle || '',
        metaDescription: pageData.metaDescription || ''
      })
    }
  }, [pageData])

  // 4. Mutations
  const saveBlocks = useMutation({
    mutationFn: async (blocks: any[]) => {
      await apiFetch(`/pages/${pageId}/blocks`, {
        method: 'PUT',
        body: JSON.stringify(blocks),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page', pageId] }),
  })

  const updateSettings = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      await apiFetch(`/pages/${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify(newSettings),
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page', pageId] }),
  })

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Editor...</div>

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans">
      <EditorHeader
        pageData={pageData}
        settings={settings}
        setSettings={setSettings}
        onSaveSettings={() => updateSettings.mutate(settings)}
        onSaveBlocks={() => saveBlocks.mutate(editor.localBlocks)}
        isSavingBlocks={saveBlocks.isPending}
        isSavingSettings={updateSettings.isPending}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onUndo={editor.undo}
        onRedo={editor.redo}
      />

      <main className="flex-1 flex overflow-hidden">
        <aside className={cn("transition-all duration-300 border-r shrink-0 overflow-hidden bg-card", editor.leftSidebarOpen ? "w-[280px]" : "w-0")}>
          <div className="w-[280px] h-full">
            <EditorSidebar
              blocks={editor.localBlocks}
              activeBlockId={editor.selectedBlockId}
              onSelectBlock={editor.setSelectedBlockId}
              onAddBlock={editor.addBlock}
            />
          </div>
        </aside>

        <EditorCanvas
          blocks={editor.localBlocks}
          onSelectBlock={editor.setSelectedBlockId}
          selectedBlockId={editor.selectedBlockId}
          onToggleLeft={() => editor.setLeftSidebarOpen(!editor.leftSidebarOpen)}
          onToggleRight={() => editor.setRightSidebarOpen(!editor.rightSidebarOpen)}
          leftOpen={editor.leftSidebarOpen}
          rightOpen={editor.rightSidebarOpen}
          onDuplicateBlock={editor.duplicateBlock}
          onRemoveBlock={editor.removeBlock}
          onMoveBlock={editor.moveBlock}
        />

        <aside className={cn("transition-all duration-300 border-l shrink-0 overflow-hidden bg-card", editor.rightSidebarOpen ? "w-[320px]" : "w-0")}>
          <div className="w-[320px] h-full">
            <EditorInspector
              selectedBlock={editor.localBlocks.find(b => b.id === editor.selectedBlockId)}
              onUpdateContent={(content) => editor.updateBlockContent(editor.selectedBlockId!, content)}
              onUpdateStyles={(styles) => editor.updateBlockStyles(editor.selectedBlockId!, styles)}
              onRemoveBlock={editor.removeBlock}
              onDuplicateBlock={editor.duplicateBlock}
            />
          </div>
        </aside>
      </main>
    </div>
  )
}