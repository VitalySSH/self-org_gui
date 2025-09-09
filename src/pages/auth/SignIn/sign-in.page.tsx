import { Button, Checkbox, Form, Image, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import './sign-in.page.scss';

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/hooks';
import { encryptPassword } from 'src/utils';
import { AuthContextProvider, SignInFormDataInterface } from 'src/interfaces';
import { AuthApiClientService } from 'src/services';

export function SignIn() {
  const location = useLocation();
  const isSignUp = location.state?.signUp || false;
  const isFollowingLink = location.state?.isFollowingLink || false;
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const authApiClientService = new AuthApiClientService();

  const onFinish = (formData: SignInFormDataInterface) => {
    const secret_password = btoa(encryptPassword(formData.password));

    if (formData.remember) {
      localStorage.setItem('email', formData.email);
      localStorage.setItem('password', formData.password);
    }

    authApiClientService
      .login(formData.email, secret_password)
      .then(async () => {
        const toMainPage = isSignUp || !isFollowingLink;
        if (!authData.user) {
          const currentUser = await authApiClientService.getCurrentUser();
          currentUser.secret_password = secret_password;
          authData.login(currentUser, toMainPage);
        } else {
          if (toMainPage) {
            navigate('/', { preventScrollReset: true });
          } else navigate(-1);
        }
      })
      .catch((error: { response: { status: number } }) => {
        if (error.response.status == 401) {
          message.warning('Введён некорректный email или пароль').then();
        } else if (error.response.status == 404) {
          message.warning('Указанный адрес электронной почты не найден').then();
        }
      });
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/sign-up', { preventScrollReset: true });
  };

  const onClickImage = () => {
    navigate('/', { preventScrollReset: true });
  };

  return (
    <div className="auth-space">
      <div className="auth-logo-container">
        <Image
          height={60}
          preview={false}
          src="/utu_logo.png"
          onClick={onClickImage}
          className="auth-logo"
          alt="UTU Logo"
        />
      </div>

      <div className="auth-form-container">
        <div className="auth-form-header">
          <h1 className="auth-form-title">Добро пожаловать!</h1>
          <p className="auth-form-subtitle">Войдите в свой аккаунт</p>
        </div>

        <Form
          name="login"
          className="auth-form"
          initialValues={{
            email: localStorage.getItem('email'),
            password: localStorage.getItem('password'),
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Электронная почта"
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите электронную почту',
              },
              {
                type: 'email',
                message: 'Пожалуйста, введите корректный электронной почты',
              },
            ]}
            hasFeedback
          >
            <Input
              prefix={<UserOutlined className="auth-form-icon" />}
              placeholder="Введите вашу электронную почту"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите пароль',
              },
              {
                whitespace: false,
              },
              // {
              //   pattern: /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/g,
              //   message: 'Используйте латинские буквы в разном регистре и цифры',
              // },
              {
                min: 4,
                message: 'Пароль должен содержать минимум 4 символа',
              },
              {
                pattern: /^[\w!@#$%^&*()\-+=~`[\]{}|\\:;"'<>,.?/]+$/,
                message:
                  'Можно использовать только латинские буквы, цифры и спецсимволы',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="auth-form-icon" />}
              type="password"
              // minLength={8}
              maxLength={128}
              placeholder="Введите ваш пароль"
              size="large"
            />
          </Form.Item>

          {/* Временно скрыта до реализации функционала
          <div className="auth-form-forgot">
            <a
              className="auth-form-forgot-link"
              href="#"
              onClick={handleForgotPassword}
            >
              Не помню пароль
            </a>
          </div>
          */}

          <Form.Item className="auth-form-remember">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="auth-checkbox">Запомнить меня</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item className="auth-form-submit">
            <Button
              type="primary"
              htmlType="submit"
              className="auth-submit-button"
              size="large"
              block
            >
              Войти
            </Button>
          </Form.Item>

          <div className="auth-form-footer">
            <span className="auth-form-footer-text">
              У меня нет аккаунта, хочу{' '}
              <a
                href="#"
                onClick={handleRegister}
                className="auth-form-register-link"
              >
                зарегистрироваться
              </a>
            </span>
          </div>
        </Form>
      </div>
    </div>
  );
}
