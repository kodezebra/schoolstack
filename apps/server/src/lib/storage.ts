const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024

export interface PhotoUploadResult {
  url: string
  success: boolean
}

export interface PhotoValidation {
  valid: boolean
  error?: string
}

export function validatePhoto(file: File): PhotoValidation {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 2MB.' }
  }
  return { valid: true }
}

export function extractR2Key(photoUrl: string): string {
  if (photoUrl.includes('/assets/')) {
    return photoUrl.split('/assets/')[1]
  }
  return photoUrl
}

export async function deletePhoto(assets: R2Bucket, photoUrl: string): Promise<void> {
  if (!photoUrl) return
  
  const key = extractR2Key(photoUrl)
  try {
    await assets.delete(key)
  } catch (err) {
    console.error('Failed to delete photo from storage:', err)
  }
}

export async function uploadPhoto(
  assets: R2Bucket,
  file: File,
  path: string,
  requestUrl: string
): Promise<PhotoUploadResult> {
  try {
    await assets.put(path, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name }
    })
  } catch (err) {
    console.error('R2 upload error:', err)
    return { url: '', success: false }
  }
  
  const origin = new URL(requestUrl).origin
  return { url: `${origin}/api/assets/${path}`, success: true }
}

export function getPhotoPath(entityType: 'students' | 'staff', id: string): string {
  return `photos/${entityType}/${id}.jpg`
}
