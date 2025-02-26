import { Navigate } from 'react-router-dom';
import { useAuth } from 'src/hooks';
import { AuthContextProvider } from 'src/interfaces';

export function ProtectedRoute(children: { children: any }) {
  const authData: AuthContextProvider = useAuth();
  if (!authData.user) {
    return <Navigate to="/sign-in" />;
  }
  // if (!is2FAVerified) {
  //     return <Navigate to='/verify-2fa' />;
  // }

  return children.children;
}
