import { Button, Checkbox, Form, Image, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

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
        if (!authData.user) {
          const currentUser = await authApiClientService.getCurrentUser();
          currentUser.secret_password = secret_password;
          authData.login(currentUser, isSignUp);
        } else {
          if (isSignUp || !isFollowingLink) {
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
  const handleForgotPassword = () => {
    console.log('Забыл пароль');
  };

  const handleRegister = () => {
    navigate('/sign-up', { preventScrollReset: true });
  };

  const onClickImage = () => {
    navigate('/', { preventScrollReset: true });
  };

  return (
    <div className="auth-space">
      <div style={{ marginBottom: 24 }}>
        <Image
          height={50}
          preview={false}
          src="/utu_logo.png"
          onClick={onClickImage}
          style={{ cursor: 'pointer' }}
        ></Image>
      </div>
      <Form
        name="login"
        className="login-form"
        initialValues={{
          email: localStorage.getItem('email'),
          password: localStorage.getItem('password'),
          remember: true,
        }}
        onFinish={onFinish}
        style={{ width: 500 }}
      >
        <Form.Item
          name="email"
          label="Электронная почта"
          labelCol={{ span: 24 }}
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
          <Input prefix={<UserOutlined className="site-form-item-icon" />} />
        </Form.Item>
        <Form.Item
          name="password"
          label="Пароль"
          labelCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: 'Пожалуйста, введите пароль',
            },
            {
              whitespace: false,
            },
            {
              pattern: /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/g,
              message: 'Используйте латинские буквы в разном регистре и цифры',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            minLength={8}
          />
        </Form.Item>
        <span>
          <a
            style={{ float: 'right' }}
            className="login-form-forgot"
            href=""
            onClick={handleForgotPassword}
          >
            Не помню пароль
          </a>
        </span>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Запомнить меня</Checkbox>
          </Form.Item>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            block
          >
            Войти
          </Button>
          <div style={{ marginTop: 20 }}>
            У меня нет аккаунта, хочу{' '}
            <a href="#" onClick={handleRegister}>
              зарегистрироваться
            </a>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
