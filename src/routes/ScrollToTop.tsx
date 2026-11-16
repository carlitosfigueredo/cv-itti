import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de pagina se vuelve arriba. Solo mira la ruta: cambiar filtros (la
// parte "?..." de la URL) no mueve la pantalla.
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
