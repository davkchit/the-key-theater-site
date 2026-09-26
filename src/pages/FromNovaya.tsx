import { Navigate, useParams } from 'react-router-dom'

// /novaya/kursy -> /kursy: links shared while the new design was being approved
export function FromNovaya() {
  const rest = useParams()['*'] ?? ''
  return <Navigate to={'/' + rest} replace />
}
