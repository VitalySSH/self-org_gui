import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import { Avatar, Button, Drawer, Flex, Form, Input, Modal, Space } from 'antd';
import { useAuth } from 'src/hooks';
import './auth-header-icons.component.scss';
import { useState } from 'react';
import TextArea from 'antd/lib/input/TextArea';
import {
  AuthContextProvider,
  UserInterface,
  UserUpdateInterface,
} from 'src/interfaces';
import { RightMenu, UploadAvatar } from 'src/components';
import { AuthApiClientService } from 'src/services';

export function AuthHeaderIcons() {
  const authData: AuthContextProvider = useAuth();
  const authApiClientService = new AuthApiClientService();

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const avatarOnClick = () => {
    setModalOpen(true);
  };

  const LogoutOnClick = () => {
    authData.logout();
  };

  const onFinish = (formData: object) => {
    const submitData = Object.assign({}, formData);
    if (authData.user?.id) {
      const user = authData.user;
      const userData: UserUpdateInterface = {};
      for (const [key, value] of Object.entries(submitData)) {
        userData[key as keyof UserUpdateInterface] = value;
        user[key as keyof UserInterface] = value;
      }
      authData.login(user, false);

      authApiClientService
        .updateUser(authData.user?.id, userData)
        .then(() => {
          setModalOpen(false);
        })
        .catch(() => setModalOpen(false));
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const drawerOnClick = () => {
    setDrawerOpen(true);
  };

  return (
    <Flex style={{ marginRight: 8 }}>
      <Space>
        <Avatar
          icon={<UserOutlined />}
          size={40}
          src={authData.avatarUrl}
          onClick={avatarOnClick}
          className="avatar"
        />
        <div className="icon-text" onClick={avatarOnClick}>
          <span>{authData.user?.fullname}</span>
        </div>
        <MenuOutlined
          style={{
            fontSize: 24,
            cursor: 'pointer',
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
        className="profile-modal"
      >
        <div className="profile-avatar">
          <UploadAvatar />
        </div>
        <Form
          name="profile"
          onFinish={onFinish}
          initialValues={{
            firstname: authData.user?.firstname,
            surname: authData.user?.surname,
            about_me: authData.user?.about_me,
            email: authData.user?.email,
          }}
          className="form-container"
        >
          <Form.Item
            name="firstname"
            label="Имя"
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
            name="surname"
            label="Фамилия"
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
          <Form.Item name="about_me" label="Обо мне" labelCol={{ span: 24 }}>
            <TextArea />
          </Form.Item>
          <Form.Item
            name="email"
            label="Электронная почта"
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите электронную почту',
              },
              {
                type: 'email',
                message: 'Пожалуйста, введите корректный электронной почты',
              },
            ]}
            hasFeedback
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
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
  );
}
