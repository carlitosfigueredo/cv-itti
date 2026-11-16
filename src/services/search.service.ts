import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore/lite'
import { getFirebase } from '@/firebase/config'
import type { PublicProfile } from '@/types/profile'
import { PAGE_SIZE, type DirectoryFilters } from '@/types/search'
import { buildFilterSpecs } from './search.filters'

export interface SearchPage {
  profiles: PublicProfile[]
  /** Documento desde el cual pedir la pagina siguiente. */
  cursor: QueryDocumentSnapshot | null
  hasMore: boolean
}

// Busca perfiles publicados con paginacion por cursor. Se piden PAGE_SIZE + 1
// documentos: el extra solo indica si hay otra pagina, sin lecturas adicionales.
export async function searchProfiles(
  filters: DirectoryFilters,
  cursor: QueryDocumentSnapshot | null = null,
): Promise<SearchPage> {
  const constraints: QueryConstraint[] = buildFilterSpecs(filters).map((spec) =>
    where(spec.field, spec.op, spec.value),
  )
  constraints.push(orderBy('updatedAt', 'desc'))
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(PAGE_SIZE + 1))

  const snapshot = await getDocs(query(collection(getFirebase().db, 'publicProfiles'), ...constraints))
  const hasMore = snapshot.docs.length > PAGE_SIZE
  const pageDocs = hasMore ? snapshot.docs.slice(0, PAGE_SIZE) : snapshot.docs

  return {
    profiles: pageDocs.map((d) => d.data() as PublicProfile),
    cursor: pageDocs.length > 0 ? (pageDocs[pageDocs.length - 1] ?? null) : null,
    hasMore,
  }
}
