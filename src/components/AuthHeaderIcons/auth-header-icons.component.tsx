import {
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  SaveOutlined,
} from '@ant-design/icons';
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

const { Text } = Typography;

export function AuthHeaderIcons() {
  const authData: AuthContextProvider = useAuth();
  const authApiClientService = new AuthApiClientService();

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

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
          <Text strong>{authData.user?.fullname}</Text>
        </div>
        <MenuOutlined className="menu-icon" onClick={drawerOnClick} />
      </Space>
      <Modal
        open={modalOpen}
        title={<span className="modal-title">Профиль пользователя</span>}
        onCancel={handleCancel}
        footer={
          <Space className="modal-footer">
            <Button danger icon={<LogoutOutlined />} onClick={LogoutOnClick}>
              Выйти
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined style={{ color: '#fff' }} />}
              onClick={() => form.submit()}
              className="save-button"
            >
              Сохранить
            </Button>
          </Space>
        }
        className="profile-modal"
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            padding: '16px 24px',
          },
          content: {
            maxHeight: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        style={{ top: 20 }}
        width={600}
      >
        <div className="profile-content">
          <div className="profile-avatar">
            <UploadAvatar />
          </div>
          <Divider className="divider" />
          <Form
            form={form}
            name="profile"
            onFinish={onFinish}
            initialValues={{
              firstname: authData.user?.firstname,
              surname: authData.user?.surname,
              about_me: authData.user?.about_me,
              email: authData.user?.email,
            }}
            className="form-container"
            layout="vertical"
          >
            <Form.Item
              name="firstname"
              label="Имя"
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, введите ваше имя',
                },
              ]}
              hasFeedback
            >
              <Input placeholder="Введите ваше имя" />
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
              hasFeedback
            >
              <Input placeholder="Введите вашу фамилию" />
            </Form.Item>
            <Form.Item name="about_me" label="Обо мне">
              <TextArea
                placeholder="Расскажите о себе"
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>
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
              hasFeedback
            >
              <Input placeholder="example@domain.com" />
            </Form.Item>
          </Form>
        </div>
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
