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
import { useAuth } from "../../hooks";
import './app-header.component.css';
import { useState } from "react";
import TextArea from "antd/lib/input/TextArea";
import { CrudDataSourceService } from "../../services";
import { UserModel } from "../../models";
import { AuthContextProvider, UserInterface } from "../../interfaces";

type NotificationPlacement = NotificationArgsProps['placement'];


export function AppHeader() {

    const [api, contextHolder] =
        notification.useNotification();
    const [open, setOpen] = useState(false);

    const authData: AuthContextProvider = useAuth();
    let userName = '';
    if (authData.user) userName = `${authData.user.firstname } ${authData.user.surname }`;

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
        if (authData.logout) authData.logout();
    }

    const onFinish = (formData: object) => {
        const submitData = Object.assign({}, formData);
        const userService = new CrudDataSourceService(UserModel);
        const userModel = userService.createRecord();
        userModel.id = authData.user?.id;
        const user = authData.user as { [key: string]: any };

        for (const [key, value] of Object.entries(submitData)) {
            userModel[key] = value;
            user[key] = value;
        }

        if (authData.login) authData.login(user as UserInterface);

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
                <div className="profile-avatar">
                    <Avatar
                        size={{ xs: 64, sm: 90, md: 128, lg: 200, xl: 256, xxl: 300 }}
                        icon={<UserOutlined />}
                    />
                </div>
                <Form
                    name='profile'
                    onFinish={onFinish}
                    initialValues={{
                        firstname: authData.user?.firstname,
                        surname: authData.user?.surname,
                        about_me: authData.user?.about_me,
                        email: authData.user?.email,
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