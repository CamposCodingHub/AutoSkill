import { Navigate } from 'react-router-dom';

interface UserOnlyRouteProps {
  children: React.ReactNode;
}

export default function UserOnlyRoute({ children }: UserOnlyRouteProps) {
  const userStr = localStorage.getItem('autoskill_user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  
  // Se for admin, redireciona para painel admin
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
