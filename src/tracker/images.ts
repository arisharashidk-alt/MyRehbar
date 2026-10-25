import { safeImage } from './model'

const MAX_SIDE = 360
const MAX_CHARS = 90_000 // about 65 KB per picture

/**
 * Turns a picture the person chose into a small JPEG thumbnail, made entirely in the browser.
 * Redrawing it on a canvas also removes anything hidden in the file (location, camera details).
 * Returns null if it isn't an image the browser can read.
 */
export async function thumbnail(file: File): Promise<string | null> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 15_000_000) return null
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return null
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#FFFFFF' // transparent PNGs get a white background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  for (const quality of [0.8, 0.65, 0.5, 0.35]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length <= MAX_CHARS) return safeImage(url) ?? null
  }
  return null
}
