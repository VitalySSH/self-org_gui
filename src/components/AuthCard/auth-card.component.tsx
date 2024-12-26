import './auth-card.component.scss'

export function AuthCard() {

    return (
        <div className="auth-card">
            <div className="auth-title">Готовы начать?</div>
            <div className="auth-description">
                Присоединяйтесь и сделайте свой голос услышанным уже сегодня!
            </div>
            <div className="auth-buttons">
                <button className="register">Зарегистрироваться</button>
                <button className="login">Войти</button>
            </div>
        </div>
    );
}
