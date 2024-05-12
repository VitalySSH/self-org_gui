import {Button, Card, Checkbox, Form, Image, Input, Space } from 'antd';
import { LockOutlined, UserAddOutlined } from '@ant-design/icons';
import { SignUpFormDataInterface} from "../../interfaces";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/lib/input/TextArea";
import { CrudDataSourceService } from "../../services";
import { UserModel } from "../../models";
import { encryptPassword } from "../../utils";
import { useLocalStorage } from "../../hooks";
import { useEffect } from "react";

export function SignUp() {

    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, _setUser] = useLocalStorage('user', null);
    const userService = new CrudDataSourceService(UserModel);

    useEffect(() => {
        if (user) navigate(-1);
    });

    const onFinish = (formData: SignUpFormDataInterface) => {
        const user = userService.createRecord();
        user.firstname = formData.firstname;
        user.surname = formData.surname;
        user.about_me = formData.about_me;
        user.email = formData.email;
        user.hashed_password = btoa(encryptPassword(formData.password));
    }

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
                    name='registration'
                    className='registration-form'
                    onFinish={onFinish}
                >
                    <Form.Item
                        name='firstname'
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
                            placeholder='Имя'
                        />
                    </Form.Item>
                    <Form.Item
                        name='surname'
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
                            placeholder='Фамилия'
                        />
                    </Form.Item>
                    <Form.Item name='about_me'>
                        <TextArea
                            placeholder='Обо мне'
                        />
                    </Form.Item>
                    <Form.Item
                        name='email'
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
                            placeholder='Электронная почта'
                        />
                    </Form.Item>
                    <Form.Item
                        name='password'
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, введите пароль, используя латинские буквы',
                            },
                            {
                                whitespace: false,
                            },
                            {
                                pattern: /[\s\w.,<>_/|\\{}$&^%?@#\-+=~`№':;()[\]]/,
                            }
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined className='site-form-item-icon'/>}
                            type='password'
                            placeholder='Пароль'
                            minLength={8}
                        />
                    </Form.Item>
                    <Form.Item
                        name='confirm_password'
                        dependencies={['password']}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, повторите пароль',
                            },
                            {
                                whitespace: false,
                            },
                            {
                                pattern: /[\s\w.,<>_/|\\{}$&^%?@#\-+=~`№':;()[\]]/,
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
                            placeholder='Подтверждение пароля'
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
