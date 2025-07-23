import { Button, Form, Image, Input, message, Steps } from 'antd';
import { LockOutlined, UserAddOutlined, MailOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { useState, useCallback } from 'react';
import './sign-up.page.scss';

import { useNavigate } from 'react-router-dom';
import { SignUpFormDataInterface, UserCreateInterface } from 'src/interfaces';
import { encryptPassword } from 'src/utils';
import { AuthApiClientService } from 'src/services';

const { Step } = Steps;

export function SignUp() {
  const navigate = useNavigate();
  const authApiClientService = new AuthApiClientService();
  const [form] = Form.useForm();

  // Состояние для управления шагами
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Partial<SignUpFormDataInterface>>({});
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  // Обработка завершения первого шага
  const handleStep1Finish = useCallback(async (values: Partial<SignUpFormDataInterface>) => {
    setIsLoadingNext(true);
    try {
      // Сохраняем данные первого шага
      setStep1Data(values);
      // Переходим ко второму шагу
      setCurrentStep(1);
      // Очищаем форму для второго шага
      form.resetFields();
    } finally {
      setIsLoadingNext(false);
    }
  }, [form]);

  // Обработка завершения второго шага (финальная отправка)
  const handleStep2Finish = useCallback(async (values: Partial<SignUpFormDataInterface>) => {
    setIsLoadingSubmit(true);
    try {
      // Объединяем данные с обоих шагов
      const completeFormData: SignUpFormDataInterface = {
        ...step1Data,
        ...values,
      } as SignUpFormDataInterface;

      const userData: UserCreateInterface = {
        firstname: completeFormData.firstname,
        surname: completeFormData.surname,
        about_me: completeFormData.about_me,
        email: completeFormData.email,
        secret_password: btoa(encryptPassword(completeFormData.password)),
      };

      const resp = await authApiClientService.createUser(userData);

      if (resp.ok) {
        navigate('/sign-in', {
          preventScrollReset: true,
          state: { signUp: true },
        });
      } else if (resp.error) {
        message.warning(resp.error);
      }
    } catch (error) {
      console.log(error);
      message.error('Произошла ошибка при регистрации. Попробуйте еще раз.');
    } finally {
      setIsLoadingSubmit(false);
    }
  }, [step1Data, authApiClientService, navigate]);

  // Возврат к первому шагу
  const handlePrevStep = useCallback(() => {
    setCurrentStep(0);
    // Восстанавливаем данные первого шага в форму
    form.setFieldsValue(step1Data);
  }, [form, step1Data]);

  const onClickImage = useCallback(() => {
    navigate('/', { preventScrollReset: true });
  }, [navigate]);

  const handleSignIn = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigate(
      '/sign-in',
      { preventScrollReset: true, state: { signUp: true } },
    );
  }, [navigate]);

  // Контент первого шага
  const renderStep1 = () => (
    <Form
      form={form}
      name="registration-step1"
      className="auth-form"
      onFinish={handleStep1Finish}
      layout="vertical"
      scrollToFirstError
      initialValues={step1Data}
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
            {
              max: 50,
              message: 'Имя не должно превышать 50 символов',
            },
            {
              pattern: /^[а-яёА-ЯЁa-zA-Z\s-]+$/,
              message: 'Имя может содержать только буквы, пробелы и дефисы',
            },
          ]}
          hasFeedback
        >
          <Input
            prefix={<UserAddOutlined className="auth-form-icon" />}
            placeholder="Введите ваше имя"
            size="large"
            maxLength={50}
            autoComplete="given-name"
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
            {
              max: 50,
              message: 'Фамилия не должна превышать 50 символов',
            },
            {
              pattern: /^[а-яёА-ЯЁa-zA-Z\s-]+$/,
              message: 'Фамилия может содержать только буквы, пробелы и дефисы',
            },
          ]}
          hasFeedback
        >
          <Input
            prefix={<UserAddOutlined className="auth-form-icon" />}
            placeholder="Введите вашу фамилию"
            size="large"
            maxLength={50}
            autoComplete="family-name"
          />
        </Form.Item>
      </div>

      <Form.Item
        name="about_me"
        label="Обо мне"
        extra="Расскажите немного о себе (необязательно)"
        rules={[
          {
            max: 500,
            message: 'Описание не должно превышать 500 символов',
          },
        ]}
      >
        <TextArea
          rows={window.innerWidth <= 576 ? 2 : 3} // Адаптивное количество строк
          placeholder="Опишите ваши интересы, опыт или цели..."
          showCount
          maxLength={500}
          autoSize={{ minRows: window.innerWidth <= 576 ? 2 : 3, maxRows: window.innerWidth <= 576 ? 3 : 4 }}
        />
      </Form.Item>

      <Form.Item className="auth-form-submit">
        <Button
          type="primary"
          htmlType="submit"
          className="ant-btn ant-btn-primary"
          size="large"
          block
          loading={isLoadingNext}
          icon={<ArrowRightOutlined />}
          iconPosition="end"
        >
          {isLoadingNext ? 'Обработка...' : 'Далее'}
        </Button>
      </Form.Item>
    </Form>
  );

  // Контент второго шага
  const renderStep2 = () => (
    <Form
      form={form}
      name="registration-step2"
      className="auth-form"
      onFinish={handleStep2Finish}
      layout="vertical"
      scrollToFirstError
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
            message: 'Пожалуйста, введите корректный адрес электронной почты',
          },
          {
            max: 100,
            message: 'Email не должен превышать 100 символов',
          },
        ]}
        hasFeedback
      >
        <Input
          prefix={<MailOutlined className="auth-form-icon" />}
          placeholder="Введите вашу электронную почту"
          size="large"
          type="email"
          autoComplete="email"
          inputMode="email"
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
            min: 8,
            message: 'Пароль должен содержать минимум 8 символов',
          },
          {
            max: 128,
            message: 'Пароль не должен превышать 128 символов',
          },
          {
            pattern: /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,}/g,
            message: 'Пароль должен содержать латинские буквы (разного регистра), цифры и спецсимволы',
          },
        ]}
        hasFeedback
      >
        <Input.Password
          prefix={<LockOutlined className="auth-form-icon" />}
          minLength={8}
          maxLength={128}
          placeholder="Создайте надежный пароль"
          size="large"
          autoComplete="new-password"
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
              return Promise.reject(new Error('Введённые пароли не совпадают'));
            },
          }),
        ]}
        hasFeedback
      >
        <Input.Password
          prefix={<LockOutlined className="auth-form-icon" />}
          minLength={8}
          maxLength={128}
          placeholder="Повторите пароль"
          size="large"
          autoComplete="new-password"
        />
      </Form.Item>

      <div className="auth-form-actions">
        <Form.Item className="auth-form-submit auth-form-actions-prev">
          <Button
            type="default"
            onClick={handlePrevStep}
            className="ant-btn ant-btn-default"
            size="large"
            icon={<ArrowLeftOutlined />}
            disabled={isLoadingSubmit}
          >
            Назад
          </Button>
        </Form.Item>

        <Form.Item className="auth-form-submit auth-form-actions-submit">
          <Button
            type="primary"
            htmlType="submit"
            className="ant-btn ant-btn-primary"
            size="large"
            loading={isLoadingSubmit}
          >
            {isLoadingSubmit ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </Form.Item>
      </div>
    </Form>
  );

  // Заголовки для шагов
  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return {
          title: 'Расскажите о себе',
          subtitle: 'Заполните основную информацию профиля',
        };
      case 1:
        return {
          title: 'Безопасность аккаунта',
          subtitle: 'Укажите email и создайте надежный пароль',
        };
      default:
        return {
          title: 'Присоединяйтесь!',
          subtitle: 'Создайте аккаунт и начните строить будущее',
        };
    }
  };

  const stepTitle = getStepTitle();

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
          loading="eager"
        />
      </div>

      <div className="auth-form-container">
        <div className="auth-form-header">
          <h1 className="auth-form-title">{stepTitle.title}</h1>
          <p className="auth-form-subtitle">{stepTitle.subtitle}</p>
        </div>

        <div className="auth-steps-container">
          <Steps
            current={currentStep}
            size="small"
            className="auth-steps"
          >
            <Step title="Личные данные" description="Имя и информация" />
            <Step title="Аккаунт" description="Email и пароль" />
          </Steps>
        </div>

        <div className="auth-step-content">
          {currentStep === 0 && renderStep1()}
          {currentStep === 1 && renderStep2()}
        </div>

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
      </div>
    </div>
  );
}