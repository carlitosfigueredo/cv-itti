import { Navigate, useLocation } from 'react-router-dom'

// El directorio ahora vive en el inicio. Se mantiene /talentos para no romper
// enlaces compartidos: redirige conservando los filtros.
export default function TalentSearchPage() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/', search }} replace />
}
