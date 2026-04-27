import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Função para verificar se o token JWT ainda é válido
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('autoskill_token')

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
