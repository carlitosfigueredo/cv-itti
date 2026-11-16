import { z } from 'zod'

// Zod intenta compilar validadores con `new Function` (eval). La Content Security
// Policy del sitio no permite eval, asi que se usa el modo sin compilacion.
// Las validaciones son las mismas; solo cambia como se ejecutan.
z.config({ jitless: true })
