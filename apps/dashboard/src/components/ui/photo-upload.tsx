import { useState, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  currentPhoto?: string | null
  entityId?: string | null
  entityType: 'student' | 'staff' | 'user'
  onUploadSuccess?: (photo: string) => void
  onDeleteSuccess?: () => void
  onFileSelect?: (file: File) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32'
}

export function PhotoUpload({
  currentPhoto,
  entityId,
  entityType,
  onUploadSuccess,
  onDeleteSuccess,
  onFileSelect,
  size = 'md',
  className
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const photoUrl = preview || (currentPhoto || null)
  const canUpload = entityId && entityId !== 'new'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File too large. Maximum size is 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)

    if (!canUpload) {
      onFileSelect?.(file)
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)

      const endpoint = entityType === 'student'
        ? `/school/students/${entityId}/photo`
        : entityType === 'staff'
        ? `/school/staff/${entityId}/photo`
        : `/auth/me/photo`

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      setPreview(null)
      onUploadSuccess?.(data.photo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentPhoto || !canUpload) return

    try {
      const endpoint = entityType === 'student'
        ? `/school/students/${entityId}/photo`
        : entityType === 'staff'
        ? `/school/staff/${entityId}/photo`
        : `/auth/me/photo`

      const res = await apiFetch(endpoint, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Delete failed')
      }

      setPreview(null)
      onDeleteSuccess?.()
    } catch (err) {
      setError('Failed to delete photo')
    }
  }

  return (
    <div className={cn('relative', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {photoUrl ? (
        <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size])}>
          <img
            src={photoUrl}
            alt="Photo"
            className="w-full h-full object-cover"
          />
          {canUpload && (
            <>
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4 text-white" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500"
                  onClick={handleDelete}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'rounded-full bg-muted flex flex-col items-center justify-center gap-1 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors',
            sizeClasses[size]
          )}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <Camera className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Photo</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

interface AvatarProps {
  photo?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl'
}

export function Avatar({ photo, name = '', size = 'md', className }: AvatarProps) {
  const photoUrl = photo || null
  
  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          avatarSizes[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium',
        avatarSizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
