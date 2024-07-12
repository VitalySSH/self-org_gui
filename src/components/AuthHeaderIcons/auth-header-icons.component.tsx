import {
    UserOutlined,
    MenuOutlined,
} from "@ant-design/icons"
import {
    Avatar,
    Button,
    Drawer,
    Flex,
    Form,
    Input,
    Modal,
    Space,
} from "antd";
import { useAuth } from "../../hooks";
import './auth-header-icons.component.css';
import { useState } from "react";
import TextArea from "antd/lib/input/TextArea";
import { CrudDataSourceService } from "../../services";
import { UserModel } from "../../models";
import { AuthContextProvider, UserInterface } from "../../interfaces";
import { RightMenu } from "../RightMenu/right-menu.component.tsx";

export function AuthHeaderIcons() {

    const [modalOpen, setModalOpen] =
        useState(false);
    const [drawerOpen, setDrawerOpen] =
        useState(false);

    const authData: AuthContextProvider = useAuth();
    let userName = '';
    if (authData.user) {
        userName = `${authData.user.firstname } ${authData.user.surname }`;
    }

    const avatarOnClick = () => {
        setModalOpen(true);
    }

    const LogoutOnClick = () => {
        authData.logout();
    }

    const onFinish = (formData: object) => {
        const submitData = Object.assign({}, formData);
        const userService =
            new CrudDataSourceService(UserModel);
        const userModel = userService.createRecord();
        userModel.id = authData.user?.id;
        const user = authData.user as { [key: string]: any };

        for (const [key, value] of Object.entries(submitData)) {
            userModel[key] = value;
            user[key] = value;
        }

        authData.login(user as UserInterface);

        userService.save(userModel).then(() => {
            setModalOpen(false);
        }).catch((error) => {
            console.log(error);
            setModalOpen(false);
        });

    }

    const handleCancel = () => {
        setModalOpen(false);
    };

    const drawerOnClick = () => {
        setDrawerOpen(true);
    }

    return (
        <Flex>
            <Space>
                <Avatar
                    icon={<UserOutlined/>}
                    size={40}
                    style={{
                        color: "black",
                        background: "white",
                        borderWidth: 2,
                        borderColor: "black",
                        cursor: "pointer",
                        marginBottom: 10,
                    }}
                    onClick={avatarOnClick}
                />
                <div className="icon-text">
                    <span>{userName}</span>
                </div>
                <MenuOutlined style={{
                    fontSize: 24,
                    cursor: "pointer",
                }}
                onClick={drawerOnClick}
                />
            </Space>
            <Modal
                open={modalOpen}
                title="Ваши данные"
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={LogoutOnClick}>
                        Выйти
                    </Button>,
                ]}
                style={{ top: 50 }}
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
            <Drawer
                closable
                destroyOnClose
                placement="right"
                width={300}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <RightMenu setDrawerOpen={setDrawerOpen} />
            </Drawer>
        </Flex>
    )
}