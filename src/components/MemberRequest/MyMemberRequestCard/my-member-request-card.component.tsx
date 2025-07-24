import { useState, useMemo } from 'react';
import { Card, Button, Badge, Typography, Tag, Tooltip, Space, Divider } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import {
  MemberRequestCardProps,
  MyMemberRequestCardItem,
} from 'src/interfaces';
import {
  CoverLetter,
  MemberRequestDisputeButton,
  MemberRequestJoinButton,
  MemberRequestRemoveButton,
} from 'src/components';
import {
  CommunityMemberCode,
  OnConsiderationCode,
  MemberExcludedCode,
  RequestSuccessfulCode,
  RequestDeniedCode,
} from 'src/consts';
import './my-member-request-card.component.scss';

const { Text, Paragraph } = Typography;

export function MyMemberRequestCard({
  item,
  setLoading,
  onShowSubCommunities,
}: MemberRequestCardProps<MyMemberRequestCardItem>) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Функция для определения цвета статуса
  const getStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case OnConsiderationCode:
        return 'processing';
      case RequestSuccessfulCode:
        return 'success';
      case RequestDeniedCode:
        return 'error';
      case CommunityMemberCode:
        return 'success';
      case MemberExcludedCode:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Функция для определения иконки статуса
  const getStatusIcon = (statusCode: string) => {
    switch (statusCode) {
      case OnConsiderationCode:
        return <InfoCircleOutlined />;
      case RequestSuccessfulCode:
      case CommunityMemberCode:
        return <UserOutlined />;
      case RequestDeniedCode:
      case MemberExcludedCode:
        return <InfoCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const renderMainAction = () => {
    switch (item.statusCode) {
      case OnConsiderationCode:
        return (
          <MemberRequestRemoveButton item={item} setLoading={setLoading} />
        );
      case RequestDeniedCode:
        return (
          <MemberRequestRemoveButton item={item} setLoading={setLoading} />
        );
      case RequestSuccessfulCode:
        return (
          <>
            <MemberRequestJoinButton item={item}/>
            <MemberRequestRemoveButton item={item} setLoading={setLoading} />
          </>
        );
      case CommunityMemberCode:
        return (
          <MemberRequestRemoveButton item={item} setLoading={setLoading} />
        );
      case MemberExcludedCode:
        return (
          <>
            <MemberRequestDisputeButton item={item} />
            <MemberRequestRemoveButton item={item} setLoading={setLoading} />
          </>
        );
      default:
        return null;
    }
  };

  const renderSubcommunitiesAction = () => {
    if (!item.children?.length) return null;

    return (
      <Tooltip title={`Подсообществ: ${item.children.length}`}>
        <Badge count={item.children.length} size="small">
          <Button
            type="default"
            icon={<TeamOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onShowSubCommunities?.(item);
            }}
            className="subcommunities-button"
          >
            Подсообщества
          </Button>
        </Badge>
      </Tooltip>
    );
  };

  // Проверяем, нужно ли показывать кнопку "Развернуть"
  const shouldShowExpandButton = useMemo(() => {
    const descriptionTooLong = item.communityDescription && item.communityDescription.length > 150;
    const reasonTooLong = item.reason && item.reason.length > 100;
    return descriptionTooLong || reasonTooLong;
  }, [item.communityDescription, item.reason]);

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`member-request-card-wrapper ${isExpanded ? 'expanded' : ''}`}>
      <Card className="member-request-card" hoverable>
        {/* Заголовок с кнопками */}
        <div className="card-header">
          <div className="header-content">
            <div className="title-section">
              <div className="community-title">
                <Text className="community-name" title={item.communityName}>
                  {item.communityName}
                </Text>
              </div>
              <Tag
                color={getStatusColor(item.statusCode)}
                icon={getStatusIcon(item.statusCode)}
                className="status-tag"
              >
                {item.status}
              </Tag>
            </div>

            <div className="actions-section">
              <Space size="small">
                {renderSubcommunitiesAction()}
                {renderMainAction()}
              </Space>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="card-body">
          {/* Описание сообщества */}
          {item.communityDescription && (
            <div className="info-section">
              <div className="section-header">
                <InfoCircleOutlined className="section-icon" />
                <Text className="section-title">Описание сообщества</Text>
              </div>
              <Paragraph className="section-content">
                {isExpanded
                  ? item.communityDescription
                  : truncateText(item.communityDescription, 150)
                }
              </Paragraph>
            </div>
          )}

          {/* Дата подачи */}
          <div className="info-section">
            <div className="section-header">
              <CalendarOutlined className="section-icon" />
              <Text className="section-title">Дата подачи заявки</Text>
            </div>
            <Text className="section-content date-content">{item.created}</Text>
          </div>

          {/* Сопроводительное письмо */}
          {item.reason && (
            <>
              <Divider className="content-divider" />
              <div className="info-section">
                <div className="section-header">
                  <FileTextOutlined className="section-icon" />
                  <Text className="section-title">Сопроводительное письмо</Text>
                </div>
                <div className="section-content">
                  <CoverLetter
                    letter={item.reason}
                    maxLength={isExpanded ? undefined : 100}
                    showIcon={false}
                  />
                </div>
              </div>
            </>
          )}

          {/* Кнопка развернуть/свернуть */}
          {shouldShowExpandButton && (
            <div className="expand-section">
              <Button
                type="text"
                size="small"
                icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="expand-button"
              >
                {isExpanded ? 'Свернуть' : 'Развернуть'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}