// Aplica el tema claro u oscuro antes de que cargue la app, para evitar un destello.
// Lee la misma clave que usa Material UI ("mui-mode": light | dark | system).
// Se carga como archivo (no inline) para poder aplicar una Content Security Policy estricta.
;(function () {
  try {
    var mode = localStorage.getItem('mui-mode') || 'system'
    if (mode === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.classList.add(mode === 'dark' ? 'dark' : 'light')
  } catch (e) {
    document.documentElement.classList.add('light')
  }
})()
