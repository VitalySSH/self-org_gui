import { useLocalStorage } from './use-local-storage.hook.tsx';
import { ProviderComponentInterface, AuthContextProviderInterface } from "../interfaces";
import { AuthContext } from './const/hooks.const.ts';



export const AuthProvider = (component: ProviderComponentInterface) => {
    const [user] = useLocalStorage('user', null);

    const value: AuthContextProviderInterface = {
        user,
    };

    return <AuthContext.Provider value={value} children={ component.children }/>;
};
