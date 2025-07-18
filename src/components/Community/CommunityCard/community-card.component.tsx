import { useState } from 'react';
import { Button, Card, Form, message, Modal, Space, Typography, Tooltip } from 'antd';
import {
  SolutionOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
  SendOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TextArea from 'antd/lib/input/TextArea';
import {
  AuthContextProvider,
  CommunityCardProps,
} from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { CrudDataSourceService } from 'src/services';
import { CommunityModel, RequestMemberModel, StatusModel } from 'src/models';
import { OnConsiderationCode } from 'src/consts';
import './community-card.component.scss';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

export function CommunityCard({ item, actions }: CommunityCardProps) {
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isSentRequest, setIsSentRequest] = useState(false);

  const successInfo = (content: string) => {
    messageApi.open({
      type: 'success',
      content: content,
    }).then();
  };

  const errorInfo = (content: string) => {
    messageApi.open({
      type: 'error',
      content: content,
    }).then();
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const onFinish = async (formData: { reason?: string }) => {
    try {
      setDisabled(true);
      const statusService = new CrudDataSourceService(StatusModel);
      const requestMemberService = new CrudDataSourceService(RequestMemberModel);
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
        communityRelation.id = item.id;
        requestMember.community = communityRelation;
        requestMember.status = status;

        await requestMemberService.save(requestMember);
        successInfo('Заявка успешно отправлена');
        setIsSentRequest(true);
      }
    } catch (error) {
      errorInfo(`Ошибка отправки запроса: ${error}`);
    } finally {
      setDisabled(false);
      setModalOpen(false);
    }
  };

  const getCardStatus = () => {
    if (item.isMyCommunity && item.isBlocked) {
      return 'blocked';
    }
    if (item.isMyCommunity && !item.isBlocked) {
      return 'member';
    }
    if (isSentRequest) {
      return 'requested';
    }
    return 'available';
  };

  const renderActions = () => {
    const status = getCardStatus();

    switch (status) {
      case 'blocked':
        return [
          <div key="blocked" className="action-content blocked-action">
            <StopOutlined className="action-icon" />
            <Text className="action-text" type="secondary">
              Заблокировано голосованием
            </Text>
          </div>
        ];

      case 'member':
        return actions;

      case 'requested':
        return [
          <div key="requested" className="action-content requested-action">
            <CheckCircleOutlined className="action-icon" />
            <Text className="action-text" style={{ color: '#52c41a' }}>
              Заявка отправлена
            </Text>
          </div>
        ];

      case 'available':
        return [
          <Button
            key="join"
            type="primary"
            icon={<SolutionOutlined />}
            onClick={() => setModalOpen(true)}
            className="join-button"
            style={{
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '13px',
              height: '36px',
              width: '100%'
            }}
          >
            Подать заявку
          </Button>
        ];

      default:
        return actions;
    }
  };

  const getOnClick = () => {
    if (item.isMyCommunity && !item.isBlocked) {
      return () => navigate(`/my-communities/${item.id}`);
    }
    return undefined;
  };

  const getCardClassName = () => {
    const baseClass = 'community-card';
    const status = getCardStatus();

    return `${baseClass} ${baseClass}--${status}`;
  };

  const renderModal = () => (
    <Modal
      open={modalOpen}
      title={
        <Space>
          <SolutionOutlined style={{ color: '#1890ff' }} />
          <span>Заявка на вступление</span>
        </Space>
      }
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
      styles={{
        header: {
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '12px',
          marginBottom: '20px'
        }
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Text type="secondary">
          Сообщество: <Text strong>{item.title}</Text>
        </Text>
      </div>

      <Form name="join-community" onFinish={onFinish} layout="vertical">
        <Form.Item
          name="reason"
          label="Сопроводительное письмо"
          extra="Расскажите о себе и причинах, по которым хотели бы вступить в сообщество"
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
            <Button
              onClick={handleCancel}
              style={{ borderRadius: '6px' }}
            >
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
    </Modal>
  );

  return (
    <>
      {contextHolder}
      {renderModal()}

      <Card
        className={getCardClassName()}
        onClick={getOnClick()}
        actions={renderActions()}
        hoverable={item.isMyCommunity && !item.isBlocked}
      >
        <div className="card-content">
          <div className="card-header">
            <Meta
              title={
                <Tooltip title={item.title} placement="top">
                  <span className="community-title">{item.title}</span>
                </Tooltip>
              }
              description={
                <Paragraph
                  className="community-description"
                  ellipsis={{ rows: 3, expandable: false }}
                >
                  {item.description || 'Описание сообщества отсутствует'}
                </Paragraph>
              }
            />
          </div>

          <div className="card-footer">
            <div className="members-info">
              <Space size="small">
                <TeamOutlined className="members-icon" />
                <Text className="members-count" type="secondary">
                  {item.members} {item.members === 1 ? 'участник' : 'участников'}
                </Text>
              </Space>
            </div>

            {item.isMyCommunity && (
              <div className="member-badge">
                <Space size="small">
                  <UserOutlined style={{ fontSize: '12px' }} />
                  <Text
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: item.isBlocked ? '#ff4d4f' : '#52c41a'
                    }}
                  >
                    {item.isBlocked ? 'Заблокирован' : 'Участник'}
                  </Text>
                </Space>
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}