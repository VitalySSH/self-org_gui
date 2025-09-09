import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  List,
  Pagination,
  Typography,
  Space,
  Spin,
  Empty,
} from 'antd';
import {
  FilterOutlined,
  PlusCircleOutlined,
  BulbOutlined,
  UserOutlined,
  TagOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FilterValues, InitiativeCardInterface } from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { InitiativeModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { ResourceFilterModal } from 'src/components';
import './initiatives.page.scss';

const { Title, Text } = Typography;

interface InitiativesProps {
  communityId: string;
}

export function Initiatives(props: InitiativesProps) {
  const maxPageSize = 20;
  const navigate = useNavigate();

  // Базовые фильтры
  const getBaseFilters = useCallback((): Filters => {
    return [
      {
        field: 'community_id',
        op: 'equals',
        val: props.communityId,
      },
    ];
  }, [props.communityId]);

  // Состояния
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<InitiativeCardInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  // Загрузка данных
  const fetchInitiatives = useCallback(() => {
    if (!loading) return;

    const initiativeService = new CrudDataSourceService(InitiativeModel);
    initiativeService
      .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
        'creator',
        'status',
        'category',
      ])
      .then((resp) => {
        setTotal(resp.total);
        const initiatives: InitiativeCardInterface[] = [];

        resp.data.forEach((initiative) => {
          const eventDate = initiative.event_date
            ? dayjs(initiative.event_date)
            : null;

          const initiativeItem: InitiativeCardInterface = {
            id: initiative.id || '',
            title: initiative.title || 'Без названия',
            description: initiative.content || '',
            tracker: initiative.tracker || '',
            creator: initiative.creator?.fullname || '',
            status: initiative.status?.name || 'Неизвестно',
            statusCode: initiative.status?.code || 'unknown',
            category: initiative.category?.name || '',
            isOneDayEvent: Boolean(initiative.is_one_day_event),
            eventDate: eventDate ? eventDate.format('DD.MM.YYYY') : '',
          };
          initiatives.push(initiativeItem);
        });

        setDataSource(initiatives);
      })
      .catch((error) => {
        console.error('Error loading initiatives:', error);
        setDataSource([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, currentPage, pageSize, loading]);

  // Эффекты
  useEffect(() => {
    fetchInitiatives();
  }, [fetchInitiatives]);

  // Сброс при изменении фильтров
  useEffect(() => {
    setFilters(getBaseFilters());
  }, [getBaseFilters]);

  // Обработчики
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  const handleApplyFilters = (values: FilterValues) => {
    const newFilters: Filters = getBaseFilters();

    if (values.title) {
      newFilters.push({
        field: 'title',
        op: 'ilike',
        val: values.title,
      });
    }

    if (values.content) {
      newFilters.push({
        field: 'content',
        op: 'ilike',
        val: values.content,
      });
    }

    if (values.isOneDayEvent) {
      newFilters.push({
        field: 'is_one_day_event',
        op: 'equals',
        val: values.isOneDayEvent,
      });
    }

    if (values.eventDate) {
      newFilters.push({
        field: 'event_date',
        op: 'equals',
        val: values.eventDate.format('YYYY-MM-DD'),
      });
    }

    if (values.status) {
      newFilters.push({
        field: 'status.id',
        op: 'equals',
        val: values.status.id,
      });
    }

    if (values.creator) {
      newFilters.push({
        field: 'creator.id',
        op: 'equals',
        val: values.creator.id,
      });
    }

    setFilters(newFilters);
    setCurrentPage(1);
    setLoading(true);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters(getBaseFilters());
    setCurrentPage(1);
    setLoading(true);
    setShowFilters(false);
  };

  const addNewInitiative = () => {
    navigate('new');
  };

  // Вспомогательные функции
  const getStatusBadgeClass = (statusCode?: string): string => {
    switch (statusCode?.toLowerCase()) {
      case 'active':
      case 'published':
      case 'ongoing':
        return 'active';
      case 'draft':
        return 'draft';
      case 'completed':
      case 'finished':
        return 'completed';
      case 'cancelled':
      case 'rejected':
        return 'cancelled';
      case 'inactive':
      case 'archived':
        return 'inactive';
      default:
        return 'draft';
    }
  };

  // Вычисляемые значения
  const activeFiltersCount = filters.length - getBaseFilters().length;
  const hasFilters = activeFiltersCount > 0;

  // Статистика
  const activeInitiatives = dataSource.filter(
    (initiative) =>
      initiative.statusCode?.toLowerCase() === 'active' ||
      initiative.statusCode?.toLowerCase() === 'published' ||
      initiative.statusCode?.toLowerCase() === 'ongoing'
  ).length;

  const draftInitiatives = dataSource.filter(
    (initiative) => initiative.statusCode?.toLowerCase() === 'draft'
  ).length;

  const completedInitiatives = dataSource.filter(
    (initiative) =>
      initiative.statusCode?.toLowerCase() === 'completed' ||
      initiative.statusCode?.toLowerCase() === 'finished'
  ).length;

  const oneDayEvents = dataSource.filter(
    (initiative) => initiative.isOneDayEvent
  ).length;

  return (
    <div className="initiatives-page">
      {/* Заголовок */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-icon">
              <BulbOutlined />
            </div>
            <div className="header-text">
              <Title level={1} className="page-title">
                Инициативы сообщества
              </Title>
              <Text type="secondary" className="page-subtitle">
                Управление идеями, предложениями и проектами сообщества
              </Text>
            </div>
          </div>

          <div className="header-actions">
            <Space size="small">
              <Button
                type="default"
                icon={<PlusCircleOutlined />}
                onClick={addNewInitiative}
                className="action-button"
                style={{
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '13px',
                  height: '36px',
                }}
              >
                Добавить
              </Button>

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
                    backgroundColor:
                      activeFiltersCount > 0 ? '#52c41a' : '#999',
                    fontSize: '10px',
                  }}
                >
                  <span
                    style={{
                      marginLeft: activeFiltersCount > 0 ? '12px' : '0',
                    }}
                  >
                    Фильтры
                  </span>
                </Badge>
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="page-content">
        <div className="content-container">
          {/* Статистика */}
          {!loading && (
            <Card className="stats-card" size="small">
              <Space split={<span className="stats-divider">•</span>} wrap>
                <Text type="secondary">
                  Всего инициатив: <Text strong>{total}</Text>
                </Text>
                {hasFilters && (
                  <Text type="secondary">
                    Найдено:{' '}
                    <Text strong style={{ color: '#fa8c16' }}>
                      {dataSource.length}
                    </Text>
                  </Text>
                )}
                {activeInitiatives > 0 && (
                  <Text type="secondary">
                    Активных:{' '}
                    <Text strong style={{ color: '#52c41a' }}>
                      {activeInitiatives}
                    </Text>
                  </Text>
                )}
                {completedInitiatives > 0 && (
                  <Text type="secondary">
                    Завершено:{' '}
                    <Text strong style={{ color: '#722ed1' }}>
                      {completedInitiatives}
                    </Text>
                  </Text>
                )}
                {draftInitiatives > 0 && (
                  <Text type="secondary">
                    Черновиков:{' '}
                    <Text strong style={{ color: '#1890ff' }}>
                      {draftInitiatives}
                    </Text>
                  </Text>
                )}
                {oneDayEvents > 0 && (
                  <Text type="secondary">
                    Одного дня:{' '}
                    <Text strong style={{ color: '#f5222d' }}>
                      {oneDayEvents}
                    </Text>
                  </Text>
                )}
                {hasFilters && (
                  <Text type="secondary">
                    Фильтров:{' '}
                    <Text strong style={{ color: '#1890ff' }}>
                      {activeFiltersCount}
                    </Text>
                  </Text>
                )}
              </Space>
            </Card>
          )}

          {/* Загрузка */}
          {loading && (
            <div className="loading-container">
              <Spin size="large" />
              <Text type="secondary" style={{ marginTop: 16 }}>
                Загрузка инициатив...
              </Text>
            </div>
          )}

          {/* Пустое состояние */}
          {!loading && !dataSource.length && (
            <Card className="empty-state-card">
              <Empty
                description={
                  hasFilters
                    ? 'По заданным фильтрам инициативы не найдены'
                    : 'В сообществе пока нет инициатив'
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '20px 0' }}
              >
                {hasFilters ? (
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleResetFilters}
                    style={{ marginTop: '16px' }}
                  >
                    Сбросить фильтры
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    onClick={addNewInitiative}
                    style={{ marginTop: '16px' }}
                  >
                    Создать первую инициативу
                  </Button>
                )}
              </Empty>
            </Card>
          )}

          {/* Список инициатив */}
          {!loading && dataSource.length > 0 && (
            <div className="initiatives-list">
              <List
                itemLayout="vertical"
                dataSource={dataSource}
                pagination={false}
                renderItem={(item: InitiativeCardInterface, index) => (
                  <div
                    key={item.id}
                    className="initiative-row-wrapper"
                    style={{
                      animationDelay: `${0.1 + index * 0.05}s`,
                    }}
                  >
                    <List.Item>
                      <Card
                        onClick={() => navigate(item.id)}
                        className="initiative-card"
                        hoverable
                      >
                        <div className="initiative-info">
                          <div className="initiative-header">
                            <div className="initiative-main">
                              <div className="initiative-title">
                                {item.title}
                              </div>
                              {item.description && (
                                <div className="initiative-description">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <div className="initiative-status">
                              <span
                                className={`status-badge ${getStatusBadgeClass(item.statusCode)}`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <div className="initiative-meta">
                            <div className="initiative-details">
                              {item.creator && (
                                <div className="meta-item">
                                  <UserOutlined className="meta-icon" />
                                  <span className="meta-value">
                                    {item.creator}
                                  </span>
                                </div>
                              )}
                              {item.category && (
                                <div className="meta-item">
                                  <TagOutlined className="meta-icon" />
                                  <span className="meta-value">
                                    {item.category}
                                  </span>
                                </div>
                              )}
                              {item.eventDate && (
                                <div className="meta-item event-date">
                                  <CalendarOutlined className="meta-icon" />
                                  <span className="meta-value">
                                    {item.eventDate}
                                  </span>
                                </div>
                              )}
                              {item.isOneDayEvent && (
                                <div className="meta-item one-day-event">
                                  <ClockCircleOutlined className="meta-icon" />
                                  <span className="meta-value">Один день</span>
                                </div>
                              )}
                            </div>
                            {item.tracker && (
                              <div className="initiative-tracker">
                                {item.tracker}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Пагинация */}
      {total > pageSize && !loading && (
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
          defaultPageSize={maxPageSize}
          showTotal={(total, range) => `${range[0]}-${range[1]} из ${total}`}
          className="initiatives-pagination"
        />
      )}

      {/* Модальное окно фильтров */}
      <ResourceFilterModal
        communityId={props.communityId}
        resource="initiative"
        visible={showFilters}
        onCancel={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}
