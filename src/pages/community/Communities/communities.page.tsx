import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Empty,
  Card,
  Space,
  Pagination,
  Typography,
  Spin,
  Segmented,
  Tooltip,
} from 'antd';
import {
  FilterOutlined,
  GlobalOutlined,
  PlusCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  AuthContextProvider,
  CommunityCardInterface,
  FilterValues,
} from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { CrudDataSourceService, CommunityAOService } from 'src/services';
import { CommunityModel, RequestMemberModel } from 'src/models';
import { CommunityCard, CommunityFilterModal } from 'src/components';
import { Filters } from 'src/shared/types.ts';
import './communities.page.scss';

const { Title, Text } = Typography;

type CommunityMode = 'all' | 'my';

interface CommunitiesProps {
  defaultMode?: CommunityMode;
}

export function Communities({ defaultMode = 'all' }: CommunitiesProps) {
  const maxPageSize = 20;
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const currentUserId = authData.user?.id;

  // Состояние режима отображения
  const [mode, setMode] = useState<CommunityMode>(defaultMode);

  // Основные состояния
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<CommunityCardInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Получение базовых фильтров в зависимости от режима
  const getBaseFilters = useCallback((): Filters => {
    if (mode === 'all') {
      return [
        {
          field: 'parent_id',
          op: 'null',
          val: true,
        },
      ];
    }
    return []; // Для "my" режима базовых фильтров нет
  }, [mode]);

  // Загрузка всех сообществ
  const loadAllCommunities = useCallback(async () => {
    const communityService = new CrudDataSourceService(CommunityModel);
    const resp = await communityService.list(
      filters,
      undefined,
      { skip: currentPage, limit: pageSize },
      [
        'user_settings.user',
        'main_settings.name',
        'main_settings.description',
      ]
    );

    setTotal(resp.total);
    const items: CommunityCardInterface[] = [];
    const communityIds = resp.data.map((com) => com.id);

    const requestMemberService = new CrudDataSourceService(RequestMemberModel);
    const memberRequests = await requestMemberService.list(
      [
        {
          field: 'community_id',
          op: 'in',
          val: communityIds,
        },
        {
          field: 'member_id',
          op: 'equals',
          val: currentUserId,
        },
        {
          field: 'parent_id',
          op: 'null',
          val: true,
        },
      ],
      undefined,
      { skip: 1, limit: pageSize },
      ['community']
    );

    resp.data.forEach((community) => {
      const isMyCommunity =
        (community.user_settings || []).filter(
          (ucs) => ucs.user?.id === currentUserId
        ).length > 0;
      const isAddRequest =
        memberRequests.data.filter(
          (rm) => rm.community?.id === community.id
        ).length > 0;

      const item = {
        id: community.id || '',
        title: community.main_settings?.name?.name || '',
        description: community.main_settings?.description?.value || '',
        members: (community.user_settings || []).length,
        isMyCommunity: isMyCommunity || isAddRequest,
      };
      items.push(item);
    });

    setDataSource(items);
  }, [currentUserId, currentPage, pageSize, filters]);

  // Загрузка моих сообществ
  const loadMyCommunities = useCallback(async () => {
    const communityService = new CommunityAOService();
    const resp = await communityService.myList(
      filters,
      undefined,
      { skip: currentPage, limit: pageSize },
      [
        'user_settings.user',
        'main_settings.name',
        'main_settings.description',
      ]
    );

    setTotal(resp.total);
    const communities: CommunityCardInterface[] = [];

    resp.data.forEach((community) => {
      const settings = (community.user_settings || []).filter(
        (settings) => settings.user?.id === authData.user?.id
      );
      const isBlocked = settings.length ? settings[0].is_blocked : false;
      const isMyCommunity =
        (community.user_settings || [])
          .filter(
            (ucs) =>
              ucs.user?.id === authData.user?.id
          ).length > 0;

      const communityItem = {
        id: community.id,
        title: community.main_settings?.name?.name || '',
        description: community.main_settings?.description?.value || '',
        members: (community.user_settings || []).length,
        isBlocked: isBlocked,
        isMyCommunity: isMyCommunity,
      };
      communities.push(communityItem);
    });

    setDataSource(communities);
  }, [authData.user?.id, currentPage, pageSize, filters]);

  // Основная функция загрузки данных
  const loadData = useCallback(async () => {
    if (!loading) return;

    try {
      if (mode === 'all') {
        await loadAllCommunities();
      } else {
        await loadMyCommunities();
      }
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, mode, loadAllCommunities, loadMyCommunities]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Сброс состояния при смене режима
  useEffect(() => {
    setCurrentPage(1);
    setFilters(getBaseFilters());
    setLoading(true);
  }, [mode, getBaseFilters]);

  const handleModeChange = (value: CommunityMode) => {
    setMode(value);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  const handleApplyFilters = (values: FilterValues) => {
    const newFilters: Filters = getBaseFilters();

    if (values.title) {
      newFilters.push({
        field: 'main_settings.name.name',
        op: 'ilike',
        val: values.title,
      });
    }

    if (values.content) {
      newFilters.push({
        field: 'main_settings.description.value',
        op: 'ilike',
        val: values.content,
      });
    }

    const baseFiltersCount = getBaseFilters().length;
    if (newFilters.length > baseFiltersCount) {
      setFilters(newFilters);
      setCurrentPage(1);
      setLoading(true);
      setShowFilters(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(getBaseFilters());
    setCurrentPage(1);
    setLoading(true);
    setShowFilters(false);
  };

  const addNewCommunity = () => {
    navigate('/new-community');
  };

  const renderHeader = () => {
    const isMyMode = mode === 'my';
    const baseFiltersCount = getBaseFilters().length;
    const activeFiltersCount = filters.length - baseFiltersCount;

    return (
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-icon">
              {isMyMode ? <UserOutlined /> : <GlobalOutlined />}
            </div>
            <div className="header-text">
              <Title level={1} className="page-title">
                {isMyMode ? 'Мои сообщества' : 'Все сообщества'}
              </Title>
              <Text type="secondary" className="page-subtitle">
                {isMyMode
                  ? 'Сообщества, в которых вы состоите'
                  : 'Все доступные сообщества платформы'
                }
              </Text>
            </div>
          </div>

          <div className="header-controls">
            <div className="mode-switcher">
              <Segmented
                value={mode}
                onChange={handleModeChange}
                options={[
                  {
                    label: (
                      <Space size="small">
                        <GlobalOutlined />
                        <span>Все</span>
                      </Space>
                    ),
                    value: 'all',
                  },
                  {
                    label: (
                      <Space size="small">
                        <UserOutlined />
                        <span>Мои</span>
                      </Space>
                    ),
                    value: 'my',
                  },
                ]}
                style={{
                  borderRadius: '8px',
                  padding: '2px',
                }}
              />
            </div>

            <div className="header-actions">
              <Space size="small">
                {isMyMode && (
                  <Tooltip title="Создать новое сообщество">
                    <Button
                      type="default"
                      icon={<PlusCircleOutlined />}
                      onClick={addNewCommunity}
                      className="action-button"
                      style={{
                        borderRadius: '6px',
                        fontWeight: 500,
                        fontSize: '13px',
                        height: '36px',
                      }}
                    >
                      Создать
                    </Button>
                  </Tooltip>
                )}

                <Button
                  type="default"
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(true)}
                  className="filter-button"
                  style={{
                    borderRadius: '6px',
                    fontWeight: 500,
                    fontSize: '13px',
                    height: '36px',
                  }}
                >
                  <Badge
                    count={activeFiltersCount}
                    size="small"
                    offset={[8, -2]}
                    style={{
                      backgroundColor: activeFiltersCount > 0 ? '#52c41a' : '#999',
                      fontSize: '10px',
                    }}
                  >
                    <span style={{ marginLeft: activeFiltersCount > 0 ? '12px' : '0' }}>
                      Фильтры
                    </span>
                  </Badge>
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (loading) return null;

    const baseFiltersCount = getBaseFilters().length;
    const activeFiltersCount = filters.length - baseFiltersCount;
    const hasFilters = activeFiltersCount > 0;
    const isMyMode = mode === 'my';

    // Подсчет статистики для моих сообществ
    let blockedCount = 0;
    let activeCount = 0;

    if (isMyMode) {
      blockedCount = dataSource.filter(item => item.isBlocked).length;
      activeCount = dataSource.filter(item => !item.isBlocked).length;
    }

    return (
      <Card className="stats-card" size="small">
        <Space split={<span className="stats-divider">•</span>} wrap>
          <Text type="secondary">
            Всего: <Text strong>{total}</Text>
          </Text>

          {isMyMode && (
            <>
              <Text type="secondary">
                Активных: <Text strong style={{ color: '#52c41a' }}>{activeCount}</Text>
              </Text>
              {blockedCount > 0 && (
                <Text type="secondary">
                  Заблокировано: <Text strong style={{ color: '#ff4d4f' }}>{blockedCount}</Text>
                </Text>
              )}
            </>
          )}

          <Text type="secondary">
            Страница: <Text strong>{currentPage}</Text>
          </Text>

          {hasFilters && (
            <Text type="secondary">
              Фильтров: <Text strong style={{ color: '#52c41a' }}>{activeFiltersCount}</Text>
            </Text>
          )}
        </Space>
      </Card>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 16 }}>
            Загрузка сообществ...
          </Text>
        </div>
      );
    }

    if (!dataSource.length) {
      const isMyMode = mode === 'my';
      const baseFiltersCount = getBaseFilters().length;
      const hasFilters = filters.length > baseFiltersCount;

      return (
        <Card className="empty-state-card">
          <Empty
            description={
              hasFilters
                ? "По заданным фильтрам сообщества не найдены"
                : isMyMode
                  ? "Вы еще не состоите ни в одном сообществе"
                  : "Сообщества не найдены"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!hasFilters && isMyMode && (
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={addNewCommunity}
                style={{ marginTop: '16px' }}
              >
                Создать первое сообщество
              </Button>
            )}
          </Empty>
        </Card>
      );
    }

    return (
      <div className="communities-list">
        {dataSource.map((item, index) => (
          <div
            key={item.id}
            className="community-row-wrapper"
            style={{
              animationDelay: `${0.1 + (index * 0.05)}s`,
            }}
          >
            <CommunityCard item={item} actions={[]} />
          </div>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (loading || total <= pageSize) return null;

    return (
      <Card className="pagination-card" size="small">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} из ${total} сообществ`
          }
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: 0,
          }}
          itemRender={(_page, type, originalElement) => {
            if (type === 'prev' || type === 'next') {
              return React.cloneElement(originalElement as React.ReactElement, {
                style: {
                  borderRadius: '6px',
                  fontWeight: 500,
                },
              });
            }
            return originalElement;
          }}
        />
      </Card>
    );
  };

  return (
    <div className="communities-page">
      {renderHeader()}

      <div className="page-content">
        <div className="content-container">
          {renderStats()}
          {renderContent()}
          {renderPagination()}
        </div>
      </div>

      <CommunityFilterModal
        visible={showFilters}
        onCancel={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}

// Экспорт с алиасами для обратной совместимости
// export const AllCommunities = () => <Communities defaultMode="all" />;
// export const MyCommunities = () => <Communities defaultMode="my" />;