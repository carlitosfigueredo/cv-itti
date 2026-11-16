import { formatBytes, MAX_CV_BYTES, validateCvFile } from './cvFile'

const pdfBytes = (size: number) => {
  const bytes = new Uint8Array(size)
  bytes.set([0x25, 0x50, 0x44, 0x46, 0x2d])
  return bytes
}
const file = (bytes: Uint8Array, name: string, type: string) => new File([bytes as BlobPart], name, { type })

describe('validateCvFile', () => {
  it('acepta un PDF valido', async () => {
    expect(await validateCvFile(file(pdfBytes(100), 'cv.pdf', 'application/pdf'))).toEqual({ ok: true })
  })

  it('acepta exactamente 5 MB y rechaza mas', async () => {
    expect((await validateCvFile(file(pdfBytes(MAX_CV_BYTES), 'cv.pdf', 'application/pdf'))).ok).toBe(true)
    const result = await validateCvFile(file(pdfBytes(MAX_CV_BYTES + 1), 'cv.pdf', 'application/pdf'))
    expect(result.ok).toBe(false)
  })

  it('rechaza archivos vacios', async () => {
    const result = await validateCvFile(file(new Uint8Array(0), 'cv.pdf', 'application/pdf'))
    expect(result).toEqual({ ok: false, message: 'El archivo está vacío.' })
  })

  it('rechaza archivos que no son PDF por tipo y extension', async () => {
    const result = await validateCvFile(file(pdfBytes(10), 'foto.png', 'image/png'))
    expect(result).toEqual({ ok: false, message: 'Solo se aceptan archivos PDF.' })
  })

  it('rechaza un archivo con extension pdf pero contenido distinto', async () => {
    const fake = new TextEncoder().encode('<html>no soy un pdf</html>')
    const result = await validateCvFile(file(fake, 'cv.pdf', 'application/pdf'))
    expect(result).toEqual({ ok: false, message: 'El archivo no parece ser un PDF válido.' })
  })
})

describe('formatBytes', () => {
  it.each([[500, '500 B'], [2048, '2 KB'], [5 * 1024 * 1024, '5.0 MB']])('%i -> %s', (n, text) => {
    expect(formatBytes(n)).toBe(text)
  })
})
