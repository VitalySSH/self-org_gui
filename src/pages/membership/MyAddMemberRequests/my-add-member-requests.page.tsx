import { Typography, Empty, Breadcrumb, Card, Space, Spin } from 'antd';
import { MyMemberRequestCardItem } from 'src/interfaces';
import { RequestMemberAoService } from 'src/services';
import { useCallback, useEffect, useState } from 'react';
import './my-add-member-requests.page.scss';
import { MyMemberRequestCard } from 'src/components';
import {
  HomeOutlined,
  TeamOutlined,
  UserAddOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

type NavigationState = {
  currentLevel: number;
  breadcrumbs: { id: string; name: string }[];
  currentData: MyMemberRequestCardItem[];
};

export function MyAddMemberRequests() {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<MyMemberRequestCardItem[]>([]);
  const [navState, setNavState] = useState<NavigationState>({
    currentLevel: 1,
    breadcrumbs: [],
    currentData: [],
  });

  const loadData = useCallback(async () => {
    if (!loading) return;

    try {
      const requestMemberAoService = new RequestMemberAoService();
      const resp = await requestMemberAoService.myList();

      setDataSource(resp.data);
      setNavState({
        currentLevel: 1,
        breadcrumbs: [],
        currentData: resp.data,
      });
    } catch (error) {
      console.error('Error loading member requests:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShowSubcommunities = useCallback((item: MyMemberRequestCardItem) => {
    if (!item.children || item.children.length === 0) return;

    setNavState((prev) => ({
      currentLevel: prev.currentLevel + 1,
      breadcrumbs: [
        ...prev.breadcrumbs,
        { id: item.key, name: item.communityName },
      ],
      currentData: item.children || [],
    }));
  }, []);

  const handleGoBack = useCallback(() => {
    setNavState({
      currentLevel: 1,
      breadcrumbs: [],
      currentData: dataSource,
    });
  }, [dataSource]);

  const handleBreadcrumbClick = useCallback((index: number) => {
    if (index === 0) {
      handleGoBack();
      return;
    }

    const newBreadcrumbs = navState.breadcrumbs.slice(0, index);
    const parentItem = newBreadcrumbs[newBreadcrumbs.length - 1];

    const findData = (
      items: MyMemberRequestCardItem[],
      targetId: string
    ): MyMemberRequestCardItem[] => {
      for (const item of items) {
        if (item.key === targetId) return item.children || [];
        if (item.children) {
          const found = findData(item.children, targetId);
          if (found.length) return found;
        }
      }
      return [];
    };

    setNavState({
      currentLevel: index + 1,
      breadcrumbs: newBreadcrumbs,
      currentData: findData(dataSource, parentItem.id),
    });
  }, [navState.breadcrumbs, dataSource]);

  const renderHeader = () => (
    <div className="page-header">
      <div className="header-content">
        <div className="header-main">
          <div className="header-icon">
            <UserAddOutlined />
          </div>
          <div className="header-text">
            <Title level={1} className="page-title">
              Мои заявки на вступление
            </Title>
            <Text type="secondary" className="page-subtitle">
              Управляйте заявками на вступление в сообщества
            </Text>
          </div>
        </div>

        {navState.currentLevel > 1 && (
          <div className="header-navigation">
            <Space>
              <ArrowLeftOutlined
                className="back-icon"
                onClick={handleGoBack}
                title="Вернуться к корню"
              />
              <Text type="secondary">
                Уровень {navState.currentLevel} из {navState.breadcrumbs.length + 1}
              </Text>
            </Space>
          </div>
        )}
      </div>
    </div>
  );

  const renderBreadcrumbs = () => {
    if (navState.currentLevel <= 1) return null;

    const breadcrumbItems = [
      {
        title: (
          <span
            className="breadcrumb-item root-item"
            onClick={handleGoBack}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleGoBack();
              }
            }}
          >
            <HomeOutlined className="breadcrumb-icon" />
            <span>Все заявки</span>
          </span>
        ),
        key: 'root',
      },
      ...navState.breadcrumbs.map((crumb, index) => ({
        title: (
          <span
            className="breadcrumb-item"
            onClick={() => handleBreadcrumbClick(index + 1)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBreadcrumbClick(index + 1);
              }
            }}
          >
            <TeamOutlined className="breadcrumb-icon" />
            <span>{crumb.name}</span>
          </span>
        ),
        key: crumb.id,
      })),
    ];

    return (
      <Card className="breadcrumb-card" size="small">
        <Breadcrumb
          items={breadcrumbItems}
          className="custom-breadcrumbs"
          separator=">"
        />
      </Card>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 16 }}>
            Загрузка заявок...
          </Text>
        </div>
      );
    }

    if (!navState.currentData.length) {
      return (
        <Card className="empty-state-card">
          <Empty
            description={
              navState.currentLevel > 1
                ? "В этом сообществе нет подсообществ с заявками"
                : "У вас нет заявок на вступление в сообщества"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <div className="requests-list">
        {navState.currentData.map((item) => (
          <MyMemberRequestCard
            key={item.key}
            item={item}
            setLoading={setLoading}
            onShowSubCommunities={handleShowSubcommunities}
          />
        ))}
      </div>
    );
  };

  const renderStats = () => {
    if (loading || !dataSource.length) return null;

    const totalRequests = navState.currentData.length;
    const hasSubcommunities = navState.currentData.some(item => item.children?.length);
    const withSubcommunitiesCount = navState.currentData.filter(item => item.children?.length).length;

    return (
      <Card className="stats-card" size="small">
        <Space split={<span className="stats-divider">•</span>}>
          <Text type="secondary">
            Заявок: <Text strong>{totalRequests}</Text>
          </Text>
          {hasSubcommunities && (
            <Text type="secondary">
              С подсообществами: <Text strong>{withSubcommunitiesCount}</Text>
            </Text>
          )}
          {navState.currentLevel > 1 && (
            <Text type="secondary">
              Уровень: <Text strong>{navState.currentLevel}</Text>
            </Text>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div className="my-add-member-requests-page">
      {renderHeader()}

      <div className="page-content">
        <div className="content-container">
          {renderBreadcrumbs()}
          {renderStats()}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}