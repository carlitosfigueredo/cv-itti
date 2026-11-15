export const MAX_CV_BYTES = 5 * 1024 * 1024
export const CV_CONTENT_TYPE = 'application/pdf'

export type CvValidation = { ok: true } | { ok: false; message: string }

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Verifica los primeros bytes: un PDF real empieza con "%PDF-".
export async function hasPdfSignature(file: Blob): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer())
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]
  return head.length === 5 && signature.every((byte, i) => head[i] === byte)
}

// Validacion de comodidad para el usuario. La seguridad real esta en las reglas de
// Storage (tamano y tipo) y en la Cloud Function validateCvUpload (contenido).
export async function validateCvFile(file: File): Promise<CvValidation> {
  if (file.size === 0) return { ok: false, message: 'El archivo está vacío.' }
  if (file.size > MAX_CV_BYTES) {
    return { ok: false, message: `El archivo pesa ${formatBytes(file.size)}. El máximo es 5 MB.` }
  }
  const looksLikePdf = file.type === CV_CONTENT_TYPE || file.name.toLowerCase().endsWith('.pdf')
  if (!looksLikePdf) return { ok: false, message: 'Solo se aceptan archivos PDF.' }
  if (!(await hasPdfSignature(file))) {
    return { ok: false, message: 'El archivo no parece ser un PDF válido.' }
  }
  return { ok: true }
}
