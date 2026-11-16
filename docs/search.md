# Búsqueda del directorio

## Cómo funciona

`/talentos` consulta `publicProfiles` con Firestore. Toda consulta incluye `isPublic == true` (las reglas rechazan listados que no lo incluyan), ordena por `updatedAt` descendente y pagina de a 20 con cursor (`startAfter`). Se piden 21 documentos: el extra solo indica si hay otra página.

El estado de la búsqueda vive en la URL (`/?q=contadora&area=finanzas&...`; los enlaces viejos a `/talentos?...` redirigen), así que los enlaces se pueden compartir y el botón "atrás" funciona. Los valores inválidos de la URL se ignoran.

| Filtro | Parámetro URL | Campo de Firestore | Tipo de condición |
|--------|---------------|--------------------|-------------------|
| Caja de búsqueda | `q` | `searchTokens` | `array-contains` (primera palabra, sin tildes, en minúsculas) |
| Área | `area` | `area` | `==` |
| País | `pais` | `country` | `==` |
| Ciudad | `ciudad` | `cityNormalized` | `==` (texto sin tildes, en minúsculas) |
| Experiencia | `experiencia` | `experienceBand` | `==` (0-1, 2-4, 5-9, 10+) |
| Modalidad | `modalidad` | `workMode` | `in [modalidad, 'any']` |
| Disponibilidad | `disponibilidad` | `availability` | `==` |

Los filtros se aplican al instante. La caja de búsqueda espera 450 ms después de la última tecla para no hacer una consulta por letra. "Disponibles" y "Remoto" son filtros rápidos de un toque. El resto vive en el panel "Más filtros" (a la derecha en escritorio, desde abajo en celular).

No hay filtro por Grupo Vázquez en el directorio: la plataforma está pensada para esa comunidad, así que no aporta. El dato sigue en el perfil y en las estadísticas de administración.

### Palabras clave (`searchTokens`)

Al guardar el perfil, el cliente genera `searchTokens` (`src/utils/searchTokens.ts`) con las palabras del titular, las habilidades, el área, la ciudad y el nombre, más sus comienzos desde 2 letras ("co", "con", ..., "contadora"). Máximo 300 elementos, validado en las reglas.

- Se busca **una palabra a la vez** (la primera que se escribe). La interfaz lo avisa si se escriben más.
- Los perfiles guardados antes de este cambio no tienen `searchTokens`: no aparecen en búsquedas por texto (sí con los demás filtros) hasta que su dueño vuelva a guardar el perfil.
- Las reglas no pueden verificar que las palabras correspondan al perfil. Si alguien infla sus palabras clave para aparecer en más búsquedas, se modera con reportes.

## Índices

`firestore.indexes.json` define un índice compuesto `(campo, updatedAt desc)` por cada filtro, más `(searchTokens array-contains, updatedAt desc)`. Firestore combina (index merging) esos índices para las consultas con varios filtros de igualdad más orden, así que no hace falta un índice por cada combinación posible.

Los emuladores no exigen índices: el primer uso real contra Firebase puede fallar con un enlace para crear un índice faltante. Desplegar los índices antes de probar:

```bash
firebase deploy --only firestore:indexes --project dev
```

Los índices tardan unos minutos en construirse. Después, verificar con `npm run check:indexes -- cv-itti-dev`: ejecuta cada forma de consulta de la app (directorio y panel de administración) y falla si alguna necesita un índice. Si se agrega una consulta nueva, sumarla al script.

## Limitaciones de Firestore como buscador

- **Búsqueda por palabras clave, no de texto libre.** Se encuentra una palabra o su comienzo; no se busca dentro del resumen ni frases completas.
- **Una sola palabra por consulta.** Firestore admite un único `array-contains` por consulta.
- **Sin tolerancia a errores de tipeo ni orden por relevancia.** La ciudad debe coincidir después de normalizar tildes y mayúsculas.
- **Orden fijo** por última actualización del perfil (incluye subir un CV).
- **Costo de lectura:** cada página cuesta hasta 21 lecturas. Con ~3.000 usuarios es bajo, pero conviene monitorearlo.

## Cuándo pasar a Algolia o Typesense

Considerar un motor de búsqueda externo si los usuarios piden búsqueda por texto libre, varias habilidades combinadas, corrección de errores de tipeo u orden por relevancia, o si el volumen de lecturas del directorio crece de forma relevante. La capa `src/services/search.service.ts` es el único punto que habla con Firestore para listar, así que el cambio queda aislado ahí. Habría que sincronizar `publicProfiles` con el motor mediante una Cloud Function y evitar indexar campos privados.
