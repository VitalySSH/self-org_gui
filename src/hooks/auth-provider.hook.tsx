import { useLocalStorage } from './use-local-storage.hook.tsx';
import {
    AuthContextProvider,
    ProviderComponent,
    UserInterface
} from "../interfaces";
import { AuthContext } from './const/hooks.const.ts';
import { useNavigate } from "react-router-dom";
import { CrudDataSourceService } from "../services";
import { UserModel } from "../models";
import FileStorageService from "../services/file-storage.service.ts";


export const AuthProvider = (component: ProviderComponent) => {

    const navigate = useNavigate();
    const [user, setUser] = useLocalStorage('user', null);
    const [avatarUrl, setAvatarUrl] =
        useLocalStorage('avatar', null);

    const fileStorageService = FileStorageService;
    const userService =
        new CrudDataSourceService(UserModel);

    const login = (user: UserInterface, toMainPage: boolean = false) => {
        setUser(user);
        changeAvatarUrl(user.foto_id);
        if (toMainPage) {
            navigate('/', { preventScrollReset: true });
        } else navigate(-1);
    };
    const logout = () => {
        setUser(null);
        navigate('/', { preventScrollReset: true });
    };

    const changeFotoId = (fotoId: string | null) => {
        user.foto_id = fotoId;
        setUser(user);
    }

    const changeAvatarUrl = (fotoId?: string | null, base64?: string) => {
        if (base64 === undefined) {
            if (fotoId) {
                try {
                    fileStorageService.getFile(fotoId)
                        .then(r => {
                            const reader = new FileReader();
                            reader.readAsDataURL(r.data);

                            reader.onload = () => {
                                setAvatarUrl(reader.result);
                            };

                            reader.onerror =
                                (error) => {
                                    console.log('Ошибка конвертации файла '
                                        + `в base64: ${error}`);
                            };
                        });
                } catch (error) {
                    console.log(`Ошибка получения файла аватара: ${error}`);
                }
            }
        } else {
            setAvatarUrl(base64);
        }
    }

    const getUserRelation = (): UserModel => {
        const userModel = userService.createRecord();
        userModel.id = user.id;

        return userModel;
    };

    const value: AuthContextProvider = {
        user,
        avatarUrl,
        login,
        logout,
        getUserRelation,
        changeFotoId,
        changeAvatarUrl,
    };


    return <AuthContext.Provider value={value} children={ component.children }/>;
};
