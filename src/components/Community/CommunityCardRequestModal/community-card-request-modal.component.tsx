import { useState } from 'react';
import { Button, Form, message, Modal, Space, Typography } from 'antd';
import {
  SolutionOutlined,
  SendOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TextArea from 'antd/lib/input/TextArea';
import { AuthContextProvider } from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { CrudDataSourceService } from 'src/services';
import { CommunityModel, RequestMemberModel, StatusModel } from 'src/models';
import { OnConsiderationCode } from 'src/consts';
import './community-card-request-modal.component.scss';

const { Text, Paragraph } = Typography;

interface CommunityCardRequestModalProps {
  open: boolean;
  communityTitle: string;
  communityId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CommunityCardRequestModal({
  open,
  communityTitle,
  communityId,
  onClose,
  onSuccess,
}: CommunityCardRequestModalProps) {
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [showSuccess, setShowSuccess] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const errorInfo = (content: string) => {
    messageApi
      .open({
        type: 'error',
        content: content,
      })
      .then();
  };

  const handleCancel = () => {
    if (showSuccess) {
      setShowSuccess(false);
    }
    onClose();
  };

  const handleGoToProfile = () => {
    navigate('/my-add-requests');
    setShowSuccess(false);
    onClose();
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const onFinish = async (formData: { reason?: string }) => {
    try {
      setDisabled(true);
      const statusService = new CrudDataSourceService(StatusModel);
      const requestMemberService = new CrudDataSourceService(
        RequestMemberModel
      );
      const communityService = new CrudDataSourceService(CommunityModel);

      const requestMember = new RequestMemberModel();
      requestMember.creator_id = authData.user?.id;
      if (formData.reason) {
        requestMember.reason = formData.reason;
      }

      const statusResp = await statusService.list([
        {
          field: 'code',
          op: 'equals',
          val: OnConsiderationCode,
        },
      ]);

      if (statusResp.data.length) {
        const status = statusResp.data[0];
        requestMember.member = authData.getUserRelation();
        const communityRelation = communityService.createRecord();
        communityRelation.id = communityId;
        requestMember.community = communityRelation;
        requestMember.status = status;

        await requestMemberService.save(requestMember);

        // Вызываем колбэк успеха и показываем экран успеха
        onSuccess();
        setShowSuccess(true);
      }
    } catch (error) {
      errorInfo(`Ошибка отправки запроса: ${error}`);
    } finally {
      setDisabled(false);
    }
  };

  const renderRequestForm = () => (
    <>
      <div style={{ marginBottom: '16px' }}>
        <Text type="secondary">
          Сообщество: <Text strong>{communityTitle}</Text>
        </Text>
      </div>

      <Form name="join-community" onFinish={onFinish} layout="vertical">
        <Form.Item
          name="reason"
          label="Сопроводительное письмо"
          extra="Расскажите о себе и причинах, по которым хотели бы вступить в сообщество"
          className="join-community-reason"
        >
          <TextArea
            rows={5}
            placeholder="Введите текст сопроводительного письма..."
            showCount
            maxLength={1000}
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>

        <Form.Item style={{ margin: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} style={{ borderRadius: '6px' }}>
              Отменить
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={disabled}
              icon={<SendOutlined />}
              style={{ borderRadius: '6px', fontWeight: 500 }}
            >
              Отправить заявку
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );

  const renderSuccessContent = () => (
    <>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <CheckCircleOutlined
          style={{
            fontSize: '48px',
            color: '#52c41a',
            marginBottom: '16px',
            display: 'block',
          }}
        />
        <Text
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#262626',
            display: 'block',
            marginBottom: '16px',
          }}
        >
          Заявка успешно отправлена!
        </Text>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Paragraph
          style={{
            fontSize: '14px',
            color: '#595959',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Ваша заявка на вступление в сообщество{' '}
          <Text strong>"{communityTitle}"</Text> успешно создана.
        </Paragraph>

        <Paragraph
          style={{
            fontSize: '14px',
            color: '#595959',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          Следить за статусом заявки можно в Личном кабинете в соответствующем разделе.
          Для этого нажмите на кнопку меню в правом верхнем углу платформы.
        </Paragraph>
      </div>

      <div
        style={{
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <Space>
          <UserOutlined style={{ color: '#52c41a' }} />
          <Button
            type="link"
            onClick={handleGoToProfile}
            style={{
              padding: 0,
              height: 'auto',
              fontSize: '14px',
              fontWeight: 500,
              color: '#52c41a',
            }}
          >
            Перейти в Мои заявки
          </Button>
        </Space>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          onClick={handleSuccessClose}
          style={{
            borderRadius: '6px',
            fontWeight: 500,
            height: '40px',
            paddingLeft: '32px',
            paddingRight: '32px',
          }}
        >
          Понятно
        </Button>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}

      <Modal
        open={open}
        title={
          showSuccess ? (
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>Заявка отправлена</span>
            </Space>
          ) : (
            <Space>
              <SolutionOutlined style={{ color: '#1890ff' }} />
              <span>Заявка на вступление</span>
            </Space>
          )
        }
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
        closable={true}
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '12px',
            marginBottom: '20px',
          },
          body: {
            padding: '24px',
          },
        }}
      >
        {showSuccess ? renderSuccessContent() : renderRequestForm()}
      </Modal>
    </>
  );
}
