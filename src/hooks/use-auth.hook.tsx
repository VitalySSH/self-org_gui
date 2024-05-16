import { createContext, useContext } from 'react';
import { useLocalStorage } from './use-local-storage.hook.tsx';
import { ProviderComponentInterface, AuthContextProviderInterface } from "../interfaces";

const AuthContext = createContext({});

export const AuthProvider = (component: ProviderComponentInterface) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, _setUser] = useLocalStorage('user', null);
    // const [is2FAVerified, setIs2FAVerified] = useState(false);
    // console.log(setIs2FAVerified);
    // console.log(setIs2FAVerified);
    // const login = async (data: any) => {
    //     setUser(data);
    //
    //     // Navigate to 2FA verification page
    //     navigate('/verify-2fa');
    // };
    //
    // const logout = () => {
    //     setUser(null);
    //     setIs2FAVerified(false);
    //     navigate('/', { replace: true });
    // };
    //
    // const verify2FACode = async (code: string) => {
    //     // Mock verification logic
    //     if (code === '0000') {
    //         setIs2FAVerified(true);
    //         navigate('/secret'); // Navigate to a protected route after successful 2FA
    //         return true;
    //     }
    //     return false;
    // };

    // const value = {
    //     user,
    //     is2FAVerified,
    //     login,
    //     logout,
    //     verify2FACode,
    // };

    const value: AuthContextProviderInterface = {
        user,
    };

    return <AuthContext.Provider value={value} children={ component.children }/>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};