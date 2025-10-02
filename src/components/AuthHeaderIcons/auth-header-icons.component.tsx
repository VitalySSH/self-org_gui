import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Space,
  Divider,
  Typography,
} from 'antd';
import { useAuth } from 'src/hooks';
import { useState, useCallback } from 'react';
import TextArea from 'antd/lib/input/TextArea';
import {
  AuthContextProvider,
  UserInterface,
  UserUpdateInterface,
} from 'src/interfaces';
import { RightMenu, UploadAvatar } from 'src/components';
import { AuthApiClientService } from 'src/services';

const { Text } = Typography;

export function AuthHeaderIcons() {
  const authData: AuthContextProvider = useAuth();
  const authApiClientService = new AuthApiClientService();

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleAvatarClick = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    authData.logout();
  }, [authData]);

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (formData: object) => {
      if (!authData.user?.id) return;

      setIsLoading(true);
      try {
        const submitData = Object.assign({}, formData);
        const user = authData.user;
        const userData: UserUpdateInterface = {};

        for (const [key, value] of Object.entries(submitData)) {
          userData[key as keyof UserUpdateInterface] = value;
          user[key as keyof UserInterface] = value;
        }

        authData.login(user, false, false);
        await authApiClientService.updateUser(authData.user.id, userData);
        setModalOpen(false);
      } catch (error) {
        console.error('Error updating user:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [authData, authApiClientService]
  );

  const handleModalCancel = useCallback(() => {
    setModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleFormSubmitClick = useCallback(() => {
    form.submit();
  }, [form]);

  const userDisplayName = authData.user?.fullname || 'Пользователь';

  return (
    <Flex className="header-icons auth-header-icons">
      <Space size="middle" className="user-info-section">
        <div className="avatar-container">
          <Avatar
            icon={<UserOutlined />}
            size={40}
            src={authData.avatarUrl}
            onClick={handleAvatarClick}
            className="user-avatar"
          />
          {/*<div className="online-indicator" />*/}
        </div>

        <div className="user-info" onClick={handleAvatarClick}>
          <Text strong className="user-name">
            {userDisplayName}
          </Text>
          {/*<Text className="user-status">В сети</Text>*/}
        </div>

        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={handleDrawerOpen}
          className="menu-button"
          size="large"
        />
      </Space>

      <Modal
        open={modalOpen}
        title={
          <div className="modal-header">
            <UserOutlined className="modal-icon" />
            <span>Профиль пользователя</span>
          </div>
        }
        onCancel={handleModalCancel}
        footer={
          <div className="modal-footer">
            <Button danger onClick={handleLogout} className="logout-button">
              Выйти
            </Button>
            <Button
              type="primary"
              onClick={handleFormSubmitClick}
              loading={isLoading}
              className="save-button"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        }
        className="profile-modal"
        width={640}
        styles={{
          body: {
            maxHeight: 'calc(90vh - 128px)',
            overflowY: 'scroll',
          },
        }}
        centered
        destroyOnHidden
      >
        <div className="profile-content">
          <div className="profile-avatar-section">
            <UploadAvatar />
          </div>

          <Divider className="content-divider" />

          <Form
            form={form}
            name="profile"
            onFinish={handleFormSubmit}
            initialValues={{
              firstname: authData.user?.firstname,
              surname: authData.user?.surname,
              about_me: authData.user?.about_me,
              email: authData.user?.email,
            }}
            className="profile-form"
            layout="vertical"
            requiredMark={false}
          >
            <div className="form-row">
              <Form.Item
                name="firstname"
                label="Имя"
                rules={[
                  {
                    required: true,
                    message: 'Пожалуйста, введите ваше имя',
                  },
                ]}
                className="form-item-half"
              >
                <Input placeholder="Введите ваше имя" size="large" />
              </Form.Item>

              <Form.Item
                name="surname"
                label="Фамилия"
                rules={[
                  {
                    required: true,
                    message: 'Пожалуйста, введите вашу фамилию',
                  },
                ]}
                className="form-item-half"
              >
                <Input placeholder="Введите вашу фамилию" size="large" />
              </Form.Item>
            </div>

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
                  message:
                    'Пожалуйста, введите корректный адрес электронной почты',
                },
              ]}
            >
              <Input placeholder="example@domain.com" size="large" />
            </Form.Item>

            <Form.Item name="about_me" label="Обо мне">
              <TextArea
                placeholder="Расскажите о себе"
                rows={4}
                showCount
                maxLength={500}
                size="large"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Drawer
        title="Личный кабинет"
        placement="right"
        width={350}
        open={drawerOpen}
        onClose={handleDrawerClose}
        className="navigation-drawer"
        destroyOnHidden
      >
        <RightMenu setDrawerOpen={setDrawerOpen} />
      </Drawer>
    </Flex>
  );
}
