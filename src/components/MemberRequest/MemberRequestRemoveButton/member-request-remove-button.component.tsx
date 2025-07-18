import { Button, Popconfirm, message } from 'antd';
import { DeleteOutlined, LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { CrudDataSourceService } from 'src/services';
import { RequestMemberModel } from 'src/models';
import { CommunityMemberCode, MemberExcludedCode } from 'src/consts';

interface MemberRequestRemoveButtonProps {
  item: {
    key: string;
    statusCode: string;
  };
  setLoading?: (loading: boolean) => void;
}

export function MemberRequestRemoveButton({
  item,
  setLoading
}: MemberRequestRemoveButtonProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const statusCodes = [CommunityMemberCode, MemberExcludedCode];
  const isMember = statusCodes.includes(item.statusCode);

  const successInfo = (content: string) => {
    messageApi.open({
      type: 'success',
      content: content,
    });
  };

  const errorInfo = (content: string) => {
    messageApi.open({
      type: 'error',
      content: content,
    });
  };

  const removeMemberRequest = async () => {
    try {
      const requestMemberService = new CrudDataSourceService(RequestMemberModel);
      await requestMemberService.delete(item.key);
      successInfo('Заявка удалена');
      if (setLoading) setLoading(true);
    } catch (error) {
      errorInfo(`Ошибка удаления заявки: ${error}`);
    }
  };

  const buttonText = isMember ? 'Покинуть' : 'Удалить';
  const confirmTitle = isMember ? 'Покинуть сообщество' : 'Удаление заявки';
  const confirmDescription = isMember
    ? 'Вы точно хотите покинуть сообщество?'
    : 'Вы точно хотите удалить эту заявку?';

  return (
    <>
      {contextHolder}
      <Popconfirm
        placement="topLeft"
        title={confirmTitle}
        description={confirmDescription}
        okText="Да"
        cancelText="Отменить"
        icon={<QuestionCircleOutlined style={{ fontSize: 16, color: '#ff4d4f' }} />}
        onConfirm={removeMemberRequest}
        overlayClassName="danger-popconfirm"
        okButtonProps={{
          danger: true,
          style: {
            borderRadius: '6px',
            fontWeight: 500,
            fontSize: '13px',
            minWidth: '70px'
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '6px',
            fontWeight: 500,
            fontSize: '13px',
            minWidth: '70px'
          }
        }}
      >
        <Button
          danger
          icon={isMember ? <LogoutOutlined /> : <DeleteOutlined />}
          className="remove-button"
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
          {buttonText}
        </Button>
      </Popconfirm>
    </>
  );
}