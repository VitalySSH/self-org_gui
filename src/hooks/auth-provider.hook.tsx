import { useLocalStorage } from './use-local-storage.hook.tsx';
import {
    ProviderComponent,
    AuthContextProvider,
    UserInterface
} from "../interfaces";
import { AuthContext } from './const/hooks.const.ts';
import { useNavigate } from "react-router-dom";



export const AuthProvider = (component: ProviderComponent) => {

    const navigate = useNavigate();
    const [user, setUser] = useLocalStorage('user', null);

    const login = (user: UserInterface) => {
        setUser(user);
        navigate(-1);
    };
    const logout = () => {
        setUser(null);
        navigate('/', { preventScrollReset: true });
    };

    const value: AuthContextProvider = {
        user,
        login,
        logout,
    };


    return <AuthContext.Provider value={value} children={ component.children }/>;
};
