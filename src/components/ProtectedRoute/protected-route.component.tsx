import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { AuthContextProviderInterface } from "../../interfaces";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function ProtectedRoute(children: { children: any }) {
    const authData: AuthContextProviderInterface = useAuth();
    if (!authData.user) {
        return <Navigate to='/sign-in' />;
    }
    // if (!is2FAVerified) {
    //     return <Navigate to='/verify-2fa' />;
    // }

    return children.children;
}
