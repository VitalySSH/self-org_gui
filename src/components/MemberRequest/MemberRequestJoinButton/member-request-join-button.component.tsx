import { useState } from 'react';
import { Button, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { RequestMemberAoService } from 'src/services';
import { useNavigate } from 'react-router-dom';

interface MemberRequestJoinButtonProps {
  item: {
    key: string;
    communityId: string;
  };
  // setLoading: (loading: boolean) => void;
}

export function MemberRequestJoinButton({
  item,
}: MemberRequestJoinButtonProps) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [buttonLoading, setButtonLoading] = useState(false);

  const errorInfo = (content: string) => {
    messageApi.open({
      type: 'error',
      content: content,
    });
  };

  const join = async () => {
    try {
      setButtonLoading(true);
      const requestMemberAOService = new RequestMemberAoService();
      await requestMemberAOService.addNewMember(item.key);
      navigate(`/communities/${item.communityId}`);
    } catch (error) {
      errorInfo(`Ошибка вступления в сообщество: ${error}`);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        htmlType="button"
        loading={buttonLoading}
        disabled={buttonLoading}
        onClick={join}
        icon={<UserAddOutlined />}
        className="join-button"
        style={{
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '12px',
          height: '32px',
          minWidth: '100px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        Вступить
      </Button>
    </>
  );
}
