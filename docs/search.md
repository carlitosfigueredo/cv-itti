# Búsqueda del directorio

## Cómo funciona

`/talentos` consulta `publicProfiles` con Firestore. Toda consulta incluye `isPublic == true` (las reglas rechazan listados que no lo incluyan), ordena por `updatedAt` descendente y pagina de a 20 con cursor (`startAfter`). Se piden 21 documentos: el extra solo indica si hay otra página.

El estado de la búsqueda vive en la URL (`/talentos?area=finanzas&pais=PY&...`), así que los enlaces se pueden compartir y el botón "atrás" funciona. Los valores inválidos de la URL se ignoran.

| Filtro | Parámetro URL | Campo de Firestore | Tipo de condición |
|--------|---------------|--------------------|-------------------|
| Área | `area` | `area` | `==` |
| País | `pais` | `country` | `==` |
| Ciudad | `ciudad` | `cityNormalized` | `==` (texto sin tildes, en minúsculas) |
| Experiencia | `experiencia` | `experienceBand` | `==` (0-1, 2-4, 5-9, 10+) |
| Modalidad | `modalidad` | `workMode` | `in [modalidad, 'any']` |
| Disponibilidad | `disponibilidad` | `availability` | `==` |
| Habilidad | `habilidad` | `skillsNormalized` | `array-contains` |
| Grupo Vázquez | `grupo-vazquez=1` | `affectedGrupoVazquez` | `== true` (solo la copia pública con consentimiento) |

## Índices

`firestore.indexes.json` define un índice compuesto `(campo, updatedAt desc)` por cada filtro, más `(skillsNormalized array-contains, updatedAt desc)`. Firestore combina (index merging) esos índices para las consultas con varios filtros de igualdad más orden, así que no hace falta un índice por cada combinación posible.

Los emuladores no exigen índices: el primer uso real contra Firebase puede fallar con un enlace para crear un índice faltante. Desplegar los índices antes de probar:

```bash
firebase deploy --only firestore:indexes --project dev
```

Los índices tardan unos minutos en construirse. Si una combinación de filtros devuelve un error de índice, agregarlo a `firestore.indexes.json`.

## Limitaciones de Firestore como buscador

- **No hay búsqueda de texto libre.** No se puede buscar "contadora" dentro del titular o del resumen. Los filtros son valores exactos.
- **Una sola habilidad por consulta.** Firestore admite un único `array-contains` por consulta.
- **Sin tolerancia a errores de tipeo ni orden por relevancia.** La ciudad debe coincidir después de normalizar tildes y mayúsculas.
- **Orden fijo** por última actualización del perfil (incluye subir un CV).
- **Costo de lectura:** cada página cuesta hasta 21 lecturas. Con ~3.000 usuarios es bajo, pero conviene monitorearlo.

## Cuándo pasar a Algolia o Typesense

Considerar un motor de búsqueda externo si los usuarios piden búsqueda por texto libre, varias habilidades combinadas, corrección de errores de tipeo u orden por relevancia, o si el volumen de lecturas del directorio crece de forma relevante. La capa `src/services/search.service.ts` es el único punto que habla con Firestore para listar, así que el cambio queda aislado ahí. Habría que sincronizar `publicProfiles` con el motor mediante una Cloud Function y evitar indexar campos privados.
