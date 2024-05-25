import {
    MailOutlined,
    BellFilled,
    UserOutlined,
    QuestionCircleFilled,
    LogoutOutlined,
} from "@ant-design/icons"
import {
    Avatar,
    Badge, Button,
    Flex, Form, Input, Modal,
    notification,
    NotificationArgsProps,
    Space
} from "antd";
import { useLocalStorage } from "../../hooks";
import { useNavigate } from "react-router-dom";
import './app-header.component.css';
import { useState } from "react";
import TextArea from "antd/lib/input/TextArea";
import { CrudDataSourceService } from "../../services";
import { UserModel } from "../../models";

type NotificationPlacement = NotificationArgsProps['placement'];


export function AppHeader() {

    const navigate = useNavigate();
    const [api, contextHolder] =
        notification.useNotification();
    const [open, setOpen] = useState(false);

    const [user, setUser] = useLocalStorage('user', null);
    let userName = '';
    if (user) {
        userName = `${user.firstname } ${user.surname }`
    }

    const avatarOnClick = () => {
        setOpen(true);
    }

    const openNotification = (placement: NotificationPlacement) => {
        api.info({
            message: `Уведомление`,
            description: 'Не тыкай сюда!',
            placement,
        });
    };

    const LogoutOnClick = () => {
        setUser(null);
        navigate('/sign-in');
    }

    const onFinish = (formData: object) => {
        const submitData = Object.assign({}, formData);
        const userService = new CrudDataSourceService(UserModel);
        const userModel = userService.createRecord();
        userModel.id = user.id;

        for (const [key, value] of Object.entries(submitData)) {
            userModel[key] = value;
            user[key] = value;
        }

        setUser(user);

        userService.save(userModel).then(() => {
            setOpen(false);
        }).catch((error) => {
            console.log(error);
            setOpen(false);
        });

    }

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <Flex>
            <Space>
                <Avatar
                    icon={<UserOutlined />}
                    size={40}
                    style={{
                        color: "black",
                        background: "white" ,
                        borderWidth: 2,
                        borderColor: "black",
                        cursor: "pointer",
                        marginBottom: 10,
                    }}
                    onClick={avatarOnClick}
                />
                <div className="user-name">
                    <span>{ userName }</span>
                </div>
                <LogoutOutlined
                    style={{
                        marginRight: 20,
                        fontSize: 24,
                        cursor: "pointer",
                    }}
                    onClick={LogoutOnClick}
                />
                <Badge count={2} dot style={{ marginRight: 20 }}>
                    <MailOutlined style={{
                        fontSize: 24,
                        marginRight: 20,
                        cursor: "pointer",
                    }}/>
                </Badge>
                <Badge count={5} style={{ marginRight: 20 }}>
                    <BellFilled style={{
                        fontSize: 24,
                        marginRight: 20,
                        cursor: "pointer",
                    }}/>
                </Badge>
                <Space>
                    {contextHolder}
                    <QuestionCircleFilled
                        onClick={() => openNotification('bottomRight')}
                        style={{
                            fontSize: 28,
                            marginRight: 20,
                            cursor: "pointer",
                        }}
                    />
                </Space>
            </Space>
            <Modal
                open={open}
                title="Ваши данные"
                onCancel={handleCancel}
                footer={[]}
            >
                <Form
                    name='profile'
                    onFinish={onFinish}
                    initialValues={{
                        firstname: user.firstname,
                        surname: user.surname,
                        about_me: user.about_me,
                        email: user.email,
                    }}
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
                        <Input />
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
                        <Input />
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
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            className='registration-form-button'
                            block
                        >
                            Сохранить
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Flex>
    )
}