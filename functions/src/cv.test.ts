import { checkCvObject, isPdfHeader, MAX_CV_BYTES, parseCvPath } from './cv'

const pdfHead = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])
const htmlHead = new TextEncoder().encode('<html>')

describe('parseCvPath', () => {
  it('acepta solo cvs/{uid}/cv.pdf', () => {
    expect(parseCvPath('cvs/abc123/cv.pdf')).toEqual({ uid: 'abc123' })
  })

  it.each(['cvs/abc/otro.pdf', 'cvs/abc/sub/cv.pdf', 'cvs//cv.pdf', 'cvs/a b/cv.pdf', 'cvs/../cv.pdf', 'otro/abc/cv.pdf', 'cvs/abc/cv.pdf.exe'])(
    'rechaza %s',
    (name) => {
      expect(parseCvPath(name)).toBeNull()
    },
  )
})

describe('isPdfHeader', () => {
  it('reconoce la firma PDF', () => {
    expect(isPdfHeader(pdfHead)).toBe(true)
    expect(isPdfHeader(htmlHead)).toBe(false)
    expect(isPdfHeader(new Uint8Array([0x25, 0x50]))).toBe(false)
  })
})

describe('checkCvObject', () => {
  const ok = { contentType: 'application/pdf', size: 1000, head: pdfHead }

  it('acepta un PDF valido', () => {
    expect(checkCvObject(ok)).toBeNull()
  })

  it('rechaza tipo incorrecto, vacio, grande o con contenido que no es PDF', () => {
    expect(checkCvObject({ ...ok, contentType: 'text/html' })).toBe('wrong-content-type')
    expect(checkCvObject({ ...ok, contentType: undefined })).toBe('wrong-content-type')
    expect(checkCvObject({ ...ok, size: 0 })).toBe('empty')
    expect(checkCvObject({ ...ok, size: MAX_CV_BYTES + 1 })).toBe('too-large')
    expect(checkCvObject({ ...ok, head: htmlHead })).toBe('not-a-pdf')
  })
})
