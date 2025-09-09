import { useLocalStorage } from './use-local-storage.hook.tsx';
import {
  AuthContextProvider,
  ProviderComponent,
  UserInterface,
} from 'src/interfaces';
import { AuthContext } from './const/hooks.const.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserModel } from 'src/models';
import { FileStorageService } from 'src/services';
import { useEffect, useRef } from 'react';

const exemptedRoutes = ['/sign-in', '/sign-up'];

export const AuthProvider = (component: ProviderComponent) => {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [user, setUser] = useLocalStorage('user', null);
  const [avatarUrl, setAvatarUrl] = useLocalStorage('avatar', null);

  // храним последнюю валидную страницу (не auth страницы)
  const lastValidPageRef = useRef<string>('/');

  const login = (user: UserInterface, toMainPage: boolean = false) => {
    setUser(user);
    changeAvatarUrl(user.foto_id);
    if (toMainPage) {
      navigate('/', { preventScrollReset: true });
    } else {
      navigate(-1);
    }
  };

  const logout = () => {
    setAvatarUrl(null);
    setUser(null);
    navigate('/', { preventScrollReset: true });
  };

  const changeFotoId = (fotoId: string | null) => {
    if (user) {
      const updatedUser = { ...user, foto_id: fotoId };
      setUser(updatedUser);
    }
  };

  const changeAvatarUrl = (fotoId?: string | null, base64?: string) => {
    if (base64 === undefined) {
      if (fotoId) {
        try {
          const fileStorageService = new FileStorageService();
          fileStorageService.getFile(fotoId).then((r) => {
            const reader = new FileReader();
            reader.readAsDataURL(r.data);

            reader.onload = () => {
              setAvatarUrl(reader.result);
            };

            reader.onerror = (error) => {
              console.log('Ошибка конвертации файла ' + `в base64: ${error}`);
            };
          });
        } catch (error) {
          console.log(`Ошибка получения файла аватара: ${error}`);
        }
      } else {
        setAvatarUrl(null);
      }
    } else {
      setAvatarUrl(base64);
    }
  };

  const getUserRelation = (): UserModel => {
    const userModel = new UserModel();
    if (user?.id) {
      userModel.id = user.id;
    }
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

  // отслеживаем изменения маршрута и сохраняем валидные страницы
  useEffect(() => {
    if (user && !exemptedRoutes.includes(location.pathname)) {
      lastValidPageRef.current = location.pathname;
    }
  }, [location.pathname, user]);

  useEffect(() => {
    if (!user || exemptedRoutes.includes(location.pathname)) return;

    const handleWindowEvents = () => {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setAvatarUrl(null);
        setUser(null);

        // Если последняя валидная страница не auth страница - значит следуем по ссылке
        const isFollowingLink = !exemptedRoutes.includes(
          lastValidPageRef.current
        );

        navigate('/sign-in', {
          preventScrollReset: true,
          state: { isFollowingLink },
        });
      }, 1800000);
    };

    window.addEventListener('mousemove', handleWindowEvents);
    window.addEventListener('keydown', handleWindowEvents);
    window.addEventListener('click', handleWindowEvents);
    window.addEventListener('scroll', handleWindowEvents);

    handleWindowEvents();

    return () => {
      window.removeEventListener('mousemove', handleWindowEvents);
      window.removeEventListener('keydown', handleWindowEvents);
      window.removeEventListener('click', handleWindowEvents);
      window.removeEventListener('scroll', handleWindowEvents);
    };
  }, [navigate, user, setAvatarUrl, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {component.children}
    </AuthContext.Provider>
  );
};
