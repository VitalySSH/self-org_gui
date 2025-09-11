import { useState } from 'react';
import { Button, Card, Space, Typography, Tooltip } from 'antd';
import {
  SolutionOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CommunityCardProps } from 'src/interfaces';
import { CommunityCardRequestModal } from 'src/components';
import './community-card.component.scss';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

export function CommunityCard({ item, actions }: CommunityCardProps) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSentRequest, setIsSentRequest] = useState(
    Boolean(item.isAddRequest)
  );

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleRequestSuccess = () => {
    setIsSentRequest(true);
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
          </div>,
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
          </div>,
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
              width: '100%',
            }}
          >
            Подать заявку
          </Button>,
        ];

      default:
        return actions;
    }
  };

  const getOnClick = () => {
    if (item.isMyCommunity && !item.isBlocked) {
      return () => navigate(`/communities/${item.id}`);
    }
    return undefined;
  };

  const getCardClassName = () => {
    const baseClass = 'community-card';
    const status = getCardStatus();

    return `${baseClass} ${baseClass}--${status}`;
  };

  return (
    <>
      <CommunityCardRequestModal
        open={modalOpen}
        communityTitle={item.title}
        communityId={item.id}
        onClose={handleModalClose}
        onSuccess={handleRequestSuccess}
      />

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
                  {item.members}{' '}
                  {item.members === 1 ? 'участник' : 'участников'}
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
                      color: item.isBlocked ? '#ff4d4f' : '#52c41a',
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
