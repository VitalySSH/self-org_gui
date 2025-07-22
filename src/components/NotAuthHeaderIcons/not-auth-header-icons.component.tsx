import { UserAddOutlined } from '@ant-design/icons';
import { Avatar, Space, Typography, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const { Text } = Typography;

export function NotAuthHeaderIcons() {
  const navigate = useNavigate();

  const handleLoginClick = useCallback(() => {
    navigate('/sign-in', { state: { isFollowingLink: true } });
  }, [navigate]);

  return (
    <Flex className="header-icons not-auth-header-icons">
      <Space size="middle" className="user-info-section">
        <div className="avatar-container">
          <Avatar
            icon={<UserAddOutlined />}
            size={40}
            onClick={handleLoginClick}
            className="guest-avatar"
          />
        </div>

        <div className="guest-info" onClick={handleLoginClick}>
          <Text strong className="user-name">Гость</Text>
          <Text className="user-status">Не авторизован</Text>
        </div>
      </Space>
    </Flex>
  );
}