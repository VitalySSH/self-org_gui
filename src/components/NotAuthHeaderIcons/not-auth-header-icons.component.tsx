import { LoginOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';

export function NotAuthHeaderIcons() {
  const navigate = useNavigate();

  const loginOnClick = () => {
    navigate('/sign-in');
  };

  return (
    <Flex>
      <LoginOutlined
        style={{
          fontSize: 24,
          cursor: 'pointer',
          marginRight: 12,
        }}
        onClick={loginOnClick}
      />
      <div
        className="icon-text"
        onClick={loginOnClick}
        style={{ marginLeft: -4 }}
      >
        <span>Войти</span>
      </div>
    </Flex>
  );
}
