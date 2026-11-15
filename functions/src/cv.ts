// Logica pura de validacion de CV (sin dependencias de Firebase para poder probarla).

// Ruta unica permitida: cvs/{uid}/cv.pdf
const CV_PATH = /^cvs\/([A-Za-z0-9]{1,128})\/cv\.pdf$/

export const MAX_CV_BYTES = 5 * 1024 * 1024
export const PDF_CONTENT_TYPE = 'application/pdf'

export function parseCvPath(objectName: string): { uid: string } | null {
  const match = CV_PATH.exec(objectName)
  return match?.[1] ? { uid: match[1] } : null
}

// Un PDF real empieza con "%PDF-".
export function isPdfHeader(head: Uint8Array): boolean {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]
  return head.length >= 5 && signature.every((byte, i) => head[i] === byte)
}

export type CvRejection = 'wrong-content-type' | 'too-large' | 'empty' | 'not-a-pdf'

export function checkCvObject(input: {
  contentType: string | undefined
  size: number
  head: Uint8Array
}): CvRejection | null {
  if (input.contentType !== PDF_CONTENT_TYPE) return 'wrong-content-type'
  if (input.size === 0) return 'empty'
  if (input.size > MAX_CV_BYTES) return 'too-large'
  if (!isPdfHeader(input.head)) return 'not-a-pdf'
  return null
}
