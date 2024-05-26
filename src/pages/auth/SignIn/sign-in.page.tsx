import { Button, Card, Checkbox, Form, Image, Input, message, Space } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

import { useNavigate} from "react-router-dom";
import { useAuth } from "../../../hooks";
import { encryptPassword } from "../../../utils";
import { AuthContextProvider, SignInFormDataInterface } from "../../../interfaces";
import AuthApiClientService from "../../../services/auth-api-client.service.ts";

export function SignIn() {

    const navigate = useNavigate();
    const authData: AuthContextProvider = useAuth();

    const onFinish = (formData: SignInFormDataInterface) => {
        formData.hashed_password = btoa(encryptPassword(formData.password));

        if (formData.remember) {
            localStorage.setItem('email', formData.email);
            localStorage.setItem('password', formData.password);
        }

        AuthApiClientService.login(formData.email, formData.hashed_password)
            .then(async () => {
                if (!authData.user && authData.login) {
                    const currentUser = await AuthApiClientService.getCurrentUser();
                    authData.login(currentUser);
                }
            }).catch((error: { response: { status: number; }; }) => {
            if (error.response.status == 401) {
                message.warning('Введён некорректный email или пароль').then();
            } else if (error.response.status == 404) {
                message.warning('Указанный адрес электронной почты не найден').then();
            }
        });
    }
    const handleForgotPassword = () => {
        console.log('Забыл пароль');
    };

    const handleRegister = () => {
        navigate('/sign-up', { preventScrollReset: true });
    };

    return (
        <Space
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Card style={{ width: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
                    <Image
                        height={60}
                        preview={false}
                        src="/utu_logo.png"
                    >
                    </Image>
                </div>
                <Form
                    name='login'
                    className='login-form'
                    initialValues={{
                        email: localStorage.getItem('email'),
                        password: localStorage.getItem('password'),
                        remember: true,
                    }}
                    onFinish={ onFinish }
                >
                    <Form.Item
                        name='email'
                        label='Электронная почта'
                        labelCol={{ span: 24 }}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, введите электронную почту',
                            },
                            {
                                type: 'email',
                                message: 'Пожалуйста, введите корректный электронной почты',
                            }
                        ]}
                        hasFeedback
                    >
                        <Input
                            prefix={<UserOutlined className='site-form-item-icon'/>}
                        />
                    </Form.Item>
                    <Form.Item
                        name='password'
                        label='Пароль'
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
                                pattern: /[\s\w.,<>_/|\\{}$&^%?@#\-+=~`№':;()[\]]/,
                                message: 'Используйте латинские буквы и цифры',
                            }
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined className='site-form-item-icon'/>}
                            type='password'
                            minLength={ 8 }
                        />
                    </Form.Item>
                    <span>
                        <a
                            style={{float: 'right'}}
                            className='login-form-forgot'
                            href=""
                            onClick={ handleForgotPassword }
                        >
                            Не помню пароль
                        </a>
                    </span>
                    <Form.Item>
                        <Form.Item name='remember' valuePropName='checked' noStyle>
                            <Checkbox>Запомнить меня</Checkbox>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            className='login-form-button'
                            block
                        >
                            Войти
                        </Button>
                        <div style={{marginTop: 20}}>
                            У меня нет аккаунта, хочу{' '}
                            <a href="#" onClick={ handleRegister }>
                                зарегистрироваться
                            </a>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </Space>
    );
}
