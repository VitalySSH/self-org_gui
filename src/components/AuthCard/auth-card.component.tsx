import './auth-card.component.scss';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';

export function AuthCard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = useCallback(
    async (path: string, options?: any) => {
      if (isLoading) return;

      setIsLoading(true);

      // Небольшая задержка для плавности анимации
      await new Promise((resolve) => setTimeout(resolve, 200));

      try {
        navigate(path, options);
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        // Сбрасываем состояние через некоторое время
        setTimeout(() => setIsLoading(false), 500);
      }
    },
    [navigate, isLoading]
  );

  return (
    <div className="auth-card">
      {/*<h2 className="auth-title">Готовы начать?</h2>*/}
      {/*<p className="auth-description">*/}
      {/*  Создайте цифровую среду для вашего сообщества — объедините знания,*/}
      {/*  опыт и идеи участников в мощный инструмент принятия решений.*/}
      {/*  Пригласите вашу команду, клуб или группу единомышленников и откройте*/}
      {/*  новый уровень коллективного мышления!*/}
      {/*</p>*/}
      <div className="auth-buttons">
        <button
          className="register"
          onClick={() => handleNavigation('/sign-up')}
          disabled={isLoading}
          aria-label="Зарегистрироваться в системе"
          type="button"
        >
          {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
        <button
          className="login"
          onClick={() =>
            handleNavigation('/sign-in', {
              preventScrollReset: true,
              state: { isFollowingLink: true },
            })
          }
          disabled={isLoading}
          aria-label="Войти в существующий аккаунт"
          type="button"
        >
          {isLoading ? 'Загрузка...' : 'Войти'}
        </button>
      </div>
    </div>
  );
}
