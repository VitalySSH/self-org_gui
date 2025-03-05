import { Button, message } from 'antd';
import { useState } from 'react';
import { RequestMemberAoService } from 'src/services';
import { useNavigate } from 'react-router-dom';

export function MemberRequestJoinButton(props: any) {
  const tableRow = props.tableRow;
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [buttonLoading, setButtonLoading] = useState(false);

  const errorInfo = (content: string) => {
    messageApi
      .open({
        type: 'error',
        content: content,
      })
      .then();
  };

  const join = () => {
    setButtonLoading(true);
    const requestMemberAOService = new RequestMemberAoService();
    requestMemberAOService
      .addNewMember(tableRow.key)
      .then(() => {
        setButtonLoading(false);
        navigate(`/my-communities/${tableRow.communityId}`);
      })
      .catch((error) => {
        setButtonLoading(false);
        errorInfo(`Ошибка вступления в сообщество: ${error}`);
      });
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
        style={{ width: '90%', maxWidth: 164 }}
      >
        Вступить
      </Button>
    </>
  );
}
