import { useLocalStorage } from './use-local-storage.hook.tsx';
import {
    ProviderComponent,
    AuthContextProvider,
    UserInterface
} from "../interfaces";
import { AuthContext } from './const/hooks.const.ts';
import { useNavigate } from "react-router-dom";
import { CrudDataSourceService } from "../services";
import { UserModel } from "../models";



export const AuthProvider = (component: ProviderComponent) => {

    const navigate = useNavigate();
    const [user, setUser] = useLocalStorage('user', null);

    const userService =
        new CrudDataSourceService(UserModel);

    const login = (user: UserInterface, toMainPage: boolean = false) => {
        setUser(user);
        if (toMainPage) {
            navigate('/', { preventScrollReset: true });
        } else navigate(-1);
    };
    const logout = () => {
        setUser(null);
        navigate('/', { preventScrollReset: true });
    };

    const getUserRelation = (): UserModel => {
        const userModel = userService.createRecord();
        userModel.id = user.id;

        return userModel;
    };

    const value: AuthContextProvider = {
        user,
        login,
        logout,
        getUserRelation,
    };


    return <AuthContext.Provider value={value} children={ component.children }/>;
};
