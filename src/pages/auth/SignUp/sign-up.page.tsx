import { Button, Card, Checkbox, Form, Image, Input, Space } from 'antd';
import { LockOutlined, UserAddOutlined } from '@ant-design/icons';

import { useNavigate } from "react-router-dom";
import TextArea from "antd/lib/input/TextArea";
import { CrudDataSourceService } from "../../../services";
import { UserModel } from "../../../models";
import { SignUpFormDataInterface } from "../../../interfaces";
import { encryptPassword } from "../../../utils";

export function SignUp(){

    const navigate = useNavigate();
    const userService =
        new CrudDataSourceService(UserModel);

    const onFinish = (formData: SignUpFormDataInterface) => {
        const userModel = userService.createRecord();
        userModel.firstname = formData.firstname;
        userModel.surname = formData.surname;
        userModel.about_me = formData.about_me;
        userModel.email = formData.email;
        userModel.hashed_password = btoa(encryptPassword(formData.password));

        userService.save(userModel).then(() => {
            navigate('/sign-in', { preventScrollReset: true });
        }).catch((error) => {
            console.log(error);
        });
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
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 30
                }}>
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
                                pattern: /[\s\w.,<>_/|\\{}$&^%?@#\-+=~`№':;()[\]]/,
                                message: 'Используйте латинские буквы и цифры',
                            }
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
                            {
                                pattern: /[\s\w.,<>_/|\\{}$&^%?@#\-+=~`№':;()[\]]/,
                                message: 'Используйте латинские буквы и цифры',
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
