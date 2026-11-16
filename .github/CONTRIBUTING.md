# Cómo contribuir

¡Gracias por sumarte! Este proyecto es el directorio **itti talentos**.

## Flujo de trabajo

1. Hacé un fork o creá una rama desde `main`: `feature/descripcion` o `fix/descripcion`.
2. Hacé commits chicos con el formato `tipo(alcance): descripción` (tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`). Mensajes en español.
3. Abrí un pull request contra `main`. La rama `main` está protegida:
   - requiere pull request y la aprobación del responsable del código (ver `.github/CODEOWNERS`);
   - requiere que pase la integración continua (lint, tipos, pruebas, build, reglas de seguridad);
   - no permite push directo ni force push.

## Entorno local

Ver el [README](README.md). Para trabajar no hacen falta credenciales reales: usá los emuladores (`npm run emulators` y `npm run dev:emu`).

## Reglas importantes

- **Nunca** subas secretos, archivos `.env.*.local`, llaves de servicio ni datos personales reales.
- Cambios en `firestore.rules`, `storage.rules` o `functions/` deben venir con pruebas.
- Los textos que ve la persona usuaria van en español con ortografía correcta (tildes y ñ). En identificadores y comentarios de código se evitan los acentos.

## Reportar problemas de seguridad

No abras un issue público: seguí [SECURITY.md](SECURITY.md).
