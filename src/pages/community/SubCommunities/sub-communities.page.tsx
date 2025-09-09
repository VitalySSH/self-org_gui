import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Empty, Card, Space, Typography, Spin } from 'antd';
import {
  FilterOutlined,
  ApartmentOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { CommunityCardInterface, FilterValues } from 'src/interfaces';
import { CommunityCard, CommunityFilterModal } from 'src/components';
import { CommunityAOService } from 'src/services';
import './sub-communities.page.scss';

const { Title, Text } = Typography;

interface SubCommunitiesProps {
  communityId: string;
}

export function SubCommunities({ communityId }: SubCommunitiesProps) {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<CommunityCardInterface[]>([]);
  const [allCommunities, setAllCommunities] = useState<
    CommunityCardInterface[]
  >([]);
  const [filter, setFilter] = useState<{ title?: string; content?: string }>(
    {}
  );
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    if (!loading || !communityId) return;

    try {
      const communityService = new CommunityAOService();
      const items = await communityService.getSubCommunities(communityId);
      setAllCommunities(items);
      applyFilters(items, filter);
    } catch (error) {
      console.error('Error loading sub-communities:', error);
    } finally {
      setLoading(false);
    }
  }, [communityId, loading, filter]);

  const applyFilters = (
    communities: CommunityCardInterface[],
    currentFilter: { title?: string; content?: string }
  ) => {
    const filteredData = communities.filter((item) => {
      const titleMatch =
        !currentFilter.title ||
        item.title.toLowerCase().includes(currentFilter.title.toLowerCase());
      const contentMatch =
        !currentFilter.content ||
        item.title.toLowerCase().includes(currentFilter.content.toLowerCase());

      return titleMatch && contentMatch;
    });
    setDataSource(filteredData);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilters = (values: FilterValues) => {
    const newFilter: { title?: string; content?: string } = {};
    if (values.title) newFilter.title = values.title;
    if (values.content) newFilter.content = values.content;

    setFilter(newFilter);
    applyFilters(allCommunities, newFilter);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilter({});
    applyFilters(allCommunities, {});
    setShowFilters(false);
  };

  const renderHeader = () => (
    <div className="page-header">
      <div className="header-content">
        <div className="header-main">
          <div className="header-icon">
            <ApartmentOutlined />
          </div>
          <div className="header-text">
            <Title level={1} className="page-title">
              Внутренние сообщества
            </Title>
            <Text type="secondary" className="page-subtitle">
              Подсообщества и дочерние структуры
            </Text>
          </div>
        </div>

        <div className="header-actions">
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
              padding: '0 16px',
            }}
          >
            <Badge
              count={Object.keys(filter).length}
              size="small"
              offset={[8, -2]}
              style={{
                backgroundColor:
                  Object.keys(filter).length > 0 ? '#fa8c16' : '#999',
                fontSize: '10px',
              }}
            >
              <span
                style={{
                  marginLeft: Object.keys(filter).length > 0 ? '12px' : '0',
                }}
              >
                Фильтры
              </span>
            </Badge>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStats = () => {
    if (loading) return null;

    const activeFiltersCount = Object.keys(filter).length;
    const hasFilters = activeFiltersCount > 0;
    const totalCommunities = allCommunities.length;
    const filteredCommunities = dataSource.length;

    return (
      <Card className="stats-card" size="small">
        <Space split={<span className="stats-divider">•</span>} wrap>
          <Text type="secondary">
            Всего: <Text strong>{totalCommunities}</Text>
          </Text>
          {hasFilters && (
            <Text type="secondary">
              Найдено:{' '}
              <Text strong style={{ color: '#fa8c16' }}>
                {filteredCommunities}
              </Text>
            </Text>
          )}
          {hasFilters && (
            <Text type="secondary">
              Фильтров:{' '}
              <Text strong style={{ color: '#fa8c16' }}>
                {activeFiltersCount}
              </Text>
            </Text>
          )}
          {!hasFilters && totalCommunities > 0 && (
            <Text type="secondary">
              Активных:{' '}
              <Text strong style={{ color: '#52c41a' }}>
                {totalCommunities}
              </Text>
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
      const isFiltered = Object.keys(filter).length > 0;
      return (
        <Card className="empty-state-card">
          <Empty
            description={
              isFiltered
                ? 'По заданным фильтрам сообщества не найдены'
                : 'В данном сообществе нет внутренних подсообществ'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '20px 0' }}
          >
            {isFiltered && (
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleResetFilters}
                style={{ marginTop: '16px' }}
              >
                Сбросить фильтры
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
              animationDelay: `${0.1 + index * 0.05}s`,
            }}
          >
            <CommunityCard item={item} actions={[]} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="sub-communities-page">
      {renderHeader()}

      <div className="page-content">
        <div className="content-container">
          {renderStats()}
          {renderContent()}
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
