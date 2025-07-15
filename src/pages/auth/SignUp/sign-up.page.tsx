import { Button, Form, Image, Input, message } from 'antd';
import { LockOutlined, UserAddOutlined, MailOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import './sign-up.page.scss';

import { useNavigate } from 'react-router-dom';
import { SignUpFormDataInterface, UserCreateInterface } from 'src/interfaces';
import { encryptPassword } from 'src/utils';
import { AuthApiClientService } from 'src/services';

export function SignUp() {
  const navigate = useNavigate();
  const authApiClientService = new AuthApiClientService();

  const onFinish = (formData: SignUpFormDataInterface) => {
    const userData: UserCreateInterface = {
      firstname: formData.firstname,
      surname: formData.surname,
      about_me: formData.about_me,
      email: formData.email,
      secret_password: btoa(encryptPassword(formData.password)),
    };

    authApiClientService
      .createUser(userData)
      .then((resp) => {
        if (resp.ok) {
          navigate('/sign-in', {
            preventScrollReset: true,
            state: { signUp: true },
          });
        } else if (resp.error) {
          message.warning(resp.error).then();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onClickImage = () => {
    navigate('/', { preventScrollReset: true });
  };

  const handleSignIn = () => {
    navigate('/sign-in', { preventScrollReset: true });
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
          <h1 className="auth-form-title">Присоединяйтесь!</h1>
          <p className="auth-form-subtitle">Создайте аккаунт и начните строить будущее</p>
        </div>

        <Form
          name="registration"
          className="auth-form"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <div className="auth-form-row">
            <Form.Item
              name="firstname"
              label="Имя"
              className="auth-form-half"
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, введите ваше имя',
                },
                {
                  min: 2,
                  message: 'Имя должно содержать минимум 2 символа',
                },
              ]}
              hasFeedback
            >
              <Input
                prefix={<UserAddOutlined className="auth-form-icon" />}
                placeholder="Введите ваше имя"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="surname"
              label="Фамилия"
              className="auth-form-half"
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, введите вашу фамилию',
                },
                {
                  min: 2,
                  message: 'Фамилия должна содержать минимум 2 символа',
                },
              ]}
              hasFeedback
            >
              <Input
                prefix={<UserAddOutlined className="auth-form-icon" />}
                placeholder="Введите вашу фамилию"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="about_me"
            label="Обо мне"
            extra="Расскажите немного о себе (необязательно)"
          >
            <TextArea
              rows={3}
              placeholder="Опишите ваши интересы, опыт или цели..."
              showCount
              maxLength={500}
            />
          </Form.Item>

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
                message: 'Пожалуйста, введите корректный адрес электронной почты',
              },
            ]}
            hasFeedback
          >
            <Input
              prefix={<MailOutlined className="auth-form-icon" />}
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
              {
                pattern:
                  /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,}/g,
                message:
                  'Пароль должен содержать латинские буквы (разного регистра), цифры и спецсимволы и быть не короче 8 символов',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="auth-form-icon" />}
              type="password"
              minLength={8}
              placeholder="Создайте надежный пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Подтверждение пароля"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, повторите пароль',
              },
              {
                whitespace: false,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Введённые пароли не совпадают');
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="auth-form-icon" />}
              type="password"
              minLength={8}
              placeholder="Повторите пароль"
              size="large"
            />
          </Form.Item>

          {/* Временно скрыт до реализации функционала
          <Form.Item className="auth-form-agreement">
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  required: true,
                  message: 'Необходимо согласиться с условиями использования',
                },
              ]}
              noStyle
            >
              <Checkbox className="auth-checkbox">
                Согласен с <a href="#" className="auth-agreement-link">условиями использования</a>
              </Checkbox>
            </Form.Item>
          </Form.Item>
          */}

          <Form.Item className="auth-form-submit">
            <Button
              type="primary"
              htmlType="submit"
              className="auth-submit-button"
              size="large"
              block
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div className="auth-form-footer">
            <span className="auth-form-footer-text">
              У меня уже есть аккаунт,{' '}
              <a
                href="#"
                onClick={handleSignIn}
                className="auth-form-signin-link"
              >
                войти
              </a>
            </span>
          </div>
        </Form>
      </div>
    </div>
  );
}