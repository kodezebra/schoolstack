import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { Upload, Loader2, Image as ImageIcon, Trash2, Plus } from 'lucide-react'
import { API_URL } from '@/config'

export function MediaPicker({ 
  onSelect,
  trigger 
}: { 
  onSelect?: (url: string) => void,
  trigger?: React.ReactNode 
}) {
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { confirm, renderConfirmDialog } = useConfirmDialog()

  const fetchAssets = async () => {
    setIsLoading(true)
    try {
      const res = await apiFetch('/assets')
      if (res.ok) {
        const data = await res.json()
        setAssets(data)
      }
    } catch (e) {
      console.error('Failed to fetch assets', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) fetchAssets()
  }, [isOpen])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await apiFetch('/assets/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        fetchAssets()
        toast({ title: 'Upload complete', description: 'Your file has been uploaded.', variant: 'success' })
      }
    } catch (e) {
      console.error('Upload failed', e)
      toast({ title: 'Upload failed', description: 'Could not upload the file.', variant: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    confirm({
      title: 'Delete Asset',
      description: 'Are you sure you want to delete this asset?',
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          const res = await apiFetch(`/assets/${id}`, { method: 'DELETE' })
          if (res.ok) {
            fetchAssets()
            toast({ title: 'Asset deleted', description: 'The file has been removed.', variant: 'success' })
          }
        } catch (e) {
          console.error('Delete failed', e)
          toast({ title: 'Delete failed', description: 'Could not delete the file.', variant: 'error' })
        }
      }
    })
  }

  const getAssetUrl = (key: string) => `${API_URL}/assets/${key}`

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" /> Media Library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] h-[600px] flex flex-col gap-4 overflow-hidden">
        <DialogHeader className="px-1 pt-1 shrink-0">
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Upload and manage your images and files.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 border rounded-md bg-muted/20 min-h-0">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : assets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic">
              <ImageIcon className="h-12 w-12 mb-4 opacity-10" />
              <p>No assets found. Upload your first file!</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {assets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="group relative aspect-square bg-card border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-all"
                  onClick={() => {
                    onSelect?.(getAssetUrl(asset.key))
                    setIsOpen(false)
                  }}
                >
                  {asset.mimeType.startsWith('image/') ? (
                    <img 
                      src={getAssetUrl(asset.key)} 
                      alt={asset.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-6 w-6 absolute top-1 right-1 rounded-full scale-75"
                      onClick={(e) => handleDelete(e, asset.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Input 
              type="file" 
              className="hidden" 
              id="media-upload" 
              onChange={handleUpload}
              disabled={isUploading}
              accept="image/*"
            />
            <Button asChild disabled={isUploading} size="sm">
              <label htmlFor="media-upload" className="cursor-pointer gap-2">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Upload
              </label>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </DialogContent>
      {renderConfirmDialog()}
    </Dialog>
  )
}
