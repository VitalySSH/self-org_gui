import { Button, Card, Checkbox, Form, Image, Input, Space } from 'antd';
import { LockOutlined, UserAddOutlined } from '@ant-design/icons';

import { useNavigate } from "react-router-dom";
import TextArea from "antd/lib/input/TextArea";
import {
    SignUpFormDataInterface,
    UserCreateInterface
} from "src/interfaces";
import { encryptPassword } from "src/utils";
import { AuthApiClientService } from "src/services";

export function SignUp(){

    const navigate = useNavigate();
    const authApiClientService = new AuthApiClientService();

    const onFinish = (formData: SignUpFormDataInterface) => {
        const userData: UserCreateInterface = {
            firstname: formData.firstname,
            surname: formData.surname,
            about_me: formData.about_me,
            email: formData.email,
            secret_password: btoa(encryptPassword(formData.password)),
        }

        authApiClientService.createUser(userData).then(() => {
            navigate('/sign-in',
                { preventScrollReset: true , state: { signUp: true }});
        }).catch((error) => {
            console.log(error);
        });
    }

    const onClickImage = () => {
        navigate('/', { preventScrollReset: true });
    }

    return (
        <Space
            className="auth-space"
        >
            <Card style={{ maxWidth: 500 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 30
                }}>
                    <Image
                        height={60}
                        preview={false}
                        src="/utu_logo.png"
                        onClick={onClickImage}
                        style={{cursor: "pointer"}}
                    >
                    </Image>
                </div>
                <Form
                    name='registration'
                    className='registration-form'
                    onFinish={onFinish}
                >
                    <Form.Item
                        name='firstname'
                        label='Имя'
                        labelCol={{ span: 24 }}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, введите ваше имя',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input
                            prefix={<UserAddOutlined className='site-form-item-icon'/>}
                        />
                    </Form.Item>
                    <Form.Item
                        name='surname'
                        label='Фамилия'
                        labelCol={{ span: 24 }}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, введите вашу фамилию',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input
                            prefix={<UserAddOutlined className='site-form-item-icon'/>}
                        />
                    </Form.Item>
                    <Form.Item
                        name='about_me'
                        label='Обо мне'
                        labelCol={{ span: 24 }}
                    >
                        <TextArea />
                    </Form.Item>
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
                            prefix={<UserAddOutlined className='site-form-item-icon'/>}
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
                                pattern: /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,}/g,
                                message: 'Пароль должен содержать латинские буквы (разного регистра), цифры и спецсимволы и быть не короче 8 символов',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined className='site-form-item-icon'/>}
                            type='password'
                            minLength={8}
                        />
                    </Form.Item>
                    <Form.Item
                        name='confirm_password'
                        label='Подтверждение пароля'
                        labelCol={{ span: 24 }}
                        dependencies={['password']}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, повторите пароль',
                            },
                            {
                                whitespace: false,
                            },
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('Введённые пароли не совпадают');
                                }
                            }),
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined className='site-form-item-icon'/>}
                            type='password'
                            minLength={8}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Form.Item
                            name='agreement'
                            valuePropName='checked'
                            rules={[
                                {
                                    required: true,
                                    message: 'Необходимо согласиться с условиями использования',
                                },
                            ]}
                            noStyle>
                            <Checkbox>
                                {" "}
                                Согласен с <a href='#'>условиями использования</a>
                            </Checkbox>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            className='registration-form-button'
                            block
                        >
                            Зарегистрироваться
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Space>
    );
}
