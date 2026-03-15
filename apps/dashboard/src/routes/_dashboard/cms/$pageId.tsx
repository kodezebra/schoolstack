import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useEditor } from '@/components/cms-editor/useEditor'
import { EditorHeader } from '@/components/cms-editor/EditorHeader'
import { EditorSidebar } from '@/components/cms-editor/EditorSidebar'
import { EditorCanvas } from '@/components/cms-editor/EditorCanvas'
import { EditorInspector } from '@/components/cms-editor/EditorInspector'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/_dashboard/cms/$pageId')({
  component: CMSPageEditor,
})

function CMSPageEditor() {
  const { pageId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState<any>(null)

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['pages', pageId],
    queryFn: async () => {
      const res = await apiFetch(`/pages/${pageId}`)
      if (!res.ok) throw new Error('Failed to fetch page')
      return res.json()
    }
  })

  const {
    localBlocks,
    selectedBlockId,
    setSelectedBlockId,
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    addBlock,
    updateBlockContent,
    updateBlockStyles,
    removeBlock,
    duplicateBlock,
    moveBlock,
    moveBlockUp,
    moveBlockDown,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
    setIsDirty
  } = useEditor(pageData?.blocks || [])

  // Prompt before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Initialize settings when pageData is loaded
  useEffect(() => {
    if (pageData && !settings) {
      setSettings({
        title: pageData.title,
        slug: pageData.slug,
        status: pageData.status,
        metaTitle: pageData.metaTitle || '',
        metaDescription: pageData.metaDescription || '',
      })
    }
  }, [pageData, settings])

  const saveBlocksMutation = useMutation({
    mutationFn: async ({ blocks, status }: { blocks: any[], status?: string }) => {
      // Save blocks
      const res = await apiFetch(`/pages/${pageId}/blocks`, {
        method: 'PUT',
        body: JSON.stringify(blocks)
      })
      if (!res.ok) throw new Error('Failed to save blocks')
      
      // Update status if provided (e.g., when publishing)
      if (status) {
        const settingsRes = await apiFetch(`/pages/${pageId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        })
        if (!settingsRes.ok) throw new Error('Failed to update status')
      }
      
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', pageId] })
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      setIsDirty(false)
    }
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const res = await apiFetch(`/pages/${pageId}`, {
        method: 'PATCH',
        body: JSON.stringify(newSettings)
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(`Failed to update settings: ${res.status} ${error}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', pageId] })
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
    onError: (error) => {
      console.error('Failed to update settings:', error)
      alert(`Failed to save settings: ${error.message}`)
    }
  })

  const deletePageMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/pages/${pageId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete page')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      navigate({ to: '/cms' })
    }
  })

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse uppercase tracking-widest">Loading Editor...</p>
        </div>
      </div>
    )
  }

  const selectedBlock = localBlocks.find(b => b.id === selectedBlockId) || null

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <EditorHeader
        pageData={pageData}
        settings={settings}
        setSettings={setSettings}
        onSaveSettings={() => updateSettingsMutation.mutate(settings)}
        onSaveBlocks={() => saveBlocksMutation.mutate({ blocks: localBlocks, status: settings.status })}
        onDeletePage={() => deletePageMutation.mutate()}
        isDeletingPage={deletePageMutation.isPending}
        isSavingBlocks={saveBlocksMutation.isPending}
        isSavingSettings={updateSettingsMutation.isPending}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {leftSidebarOpen && (
          <EditorSidebar 
            blocks={localBlocks}
            activeBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onAddBlock={addBlock}
            onMoveBlock={moveBlock}
            onMoveBlockUp={moveBlockUp}
            onMoveBlockDown={moveBlockDown}
          />
        )}
        
        <EditorCanvas 
          blocks={localBlocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onToggleLeft={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onToggleRight={() => setRightSidebarOpen(!rightSidebarOpen)}
          leftOpen={leftSidebarOpen}
          rightOpen={rightSidebarOpen}
          onDuplicateBlock={duplicateBlock}
          onRemoveBlock={removeBlock}
        />

        {rightSidebarOpen && (
          <div className="w-[320px] shrink-0 overflow-y-auto">
            <EditorInspector 
              selectedBlock={selectedBlock}
              onUpdateContent={(content) => updateBlockContent(selectedBlockId!, content)}
              onUpdateStyles={(styles) => updateBlockStyles(selectedBlockId!, styles)}
              onRemoveBlock={removeBlock}
              onDuplicateBlock={duplicateBlock}
            />
          </div>
        )}
      </div>
    </div>
  )
}