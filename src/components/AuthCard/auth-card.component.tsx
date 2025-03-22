import './auth-card.component.scss';
import { useNavigate } from 'react-router-dom';

export function AuthCard() {
  const navigate = useNavigate();

  return (
    <div className="auth-card">
      <div className="auth-title">Готовы начать?</div>
      <div className="auth-description">
        Присоединяйтесь и сделайте свой голос услышанным уже сегодня!
      </div>
      <div className="auth-buttons">
        <button
          className="register"
          onClick={() => {
            navigate('/sign-up');
          }}
        >
          Зарегистрироваться
        </button>
        <button
          className="login"
          onClick={() => {
            navigate('/sign-in', {
              preventScrollReset: true,
              state: { isFollowingLink: true },
            });
          }}
        >
          Войти
        </button>
      </div>
    </div>
  );
}
