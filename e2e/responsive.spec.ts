import { expect, test, type Page } from '@playwright/test'

// Anchos tipicos: celular chico, celular, tablet y escritorio.
const VIEWPORTS = [
  { name: 'celular-320', width: 320, height: 640 },
  { name: 'celular-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'escritorio-1280', width: 1280, height: 800 },
] as const
const SCHEMES = ['light', 'dark'] as const

// Falla si la pagina tiene scroll horizontal o si algun elemento se sale por la
// derecha (aunque un contenedor lo oculte). Ignora lo que esta dentro de areas con
// scroll horizontal propio, como tablas o pestanas.
async function expectNoHorizontalScroll(page: Page) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const insideScroller = (el: Element) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX
        if ((ox === 'auto' || ox === 'scroll') && p !== document.documentElement && p !== document.body) return true
      }
      return false
    }
    const offenders = Array.from(document.body.querySelectorAll('*'))
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.right > width + 1 && !insideScroller(el)
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')} (${Math.round(el.getBoundingClientRect().right)}px)`)
    return { scroll: document.documentElement.scrollWidth - width, offenders }
  })
  expect(result.offenders, `elementos que se salen del ancho (${await page.evaluate(() => window.innerWidth)}px)`).toEqual([])
  expect(result.scroll, 'la pagina no debe tener scroll horizontal').toBeLessThanOrEqual(0)
}

for (const scheme of SCHEMES) {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name} ${scheme}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme })

      test('inicio: banner del CV y talentos', async ({ page }) => {
        await page.goto('/')
        await expect(page.getByRole('heading', { name: /cargá tu cv/i })).toBeVisible()
        await expect(page.getByRole('link', { name: /ana lópez benítez/i })).toBeVisible()
        await expectNoHorizontalScroll(page)
        await page.screenshot({ path: `e2e/.screenshots/inicio-${vp.name}-${scheme}.png`, fullPage: true })
      })

      test('perfil publico', async ({ page }) => {
        await page.goto('/talentos/maria')
        await expect(page.getByRole('heading', { level: 1, name: /maría josé/i })).toBeVisible()
        await expectNoHorizontalScroll(page)
        await page.screenshot({ path: `e2e/.screenshots/perfil-${vp.name}-${scheme}.png`, fullPage: true })
      })

      test('ingresar', async ({ page }) => {
        await page.goto('/login')
        await expect(page.getByRole('button', { name: /continuar con google/i })).toBeVisible()
        await expectNoHorizontalScroll(page)
        await page.screenshot({ path: `e2e/.screenshots/login-${vp.name}-${scheme}.png`, fullPage: true })
      })
    })
  }
}

test.describe('tema claro y oscuro', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'light' })

  test('el boton cambia el tema y la eleccion se recuerda al recargar', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveClass(/light/)
    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click()
    await expect(html).toHaveClass(/dark/)
    await page.reload()
    await expect(html).toHaveClass(/dark/)
    await expect(page.getByRole('button', { name: 'Cambiar a tema claro' })).toBeVisible()
  })

  test('en celular los filtros arrancan plegados y se pueden abrir', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('combobox', { name: 'Área' })).toBeHidden()
    await page.getByRole('button', { name: /filtrar talentos/i }).click()
    await expect(page.getByRole('combobox', { name: 'Área' })).toBeVisible()
  })
})
