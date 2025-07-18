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
  Empty
} from 'antd';
import {
  FilterOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  TagOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FilterValues, RuleCardInterface } from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { RuleModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { ResourceFilterModal } from 'src/components';
import './rules.page.scss';

const { Title, Text } = Typography;

interface RulesProps {
  communityId: string;
}

export function Rules(props: RulesProps) {
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
  const [dataSource, setDataSource] = useState<RuleCardInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  // Загрузка данных
  const loadData = useCallback(() => {
    if (!loading) return;

    const ruleService = new CrudDataSourceService(RuleModel);
    ruleService
      .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
        'creator',
        'status',
        'category',
      ])
      .then((resp) => {
        setTotal(resp.total);
        const rules: RuleCardInterface[] = [];

        resp.data.forEach((rule) => {
          const ruleItem: RuleCardInterface = {
            id: rule.id || '',
            title: rule.title || 'Без названия',
            description: rule.content || '',
            tracker: rule.tracker || '',
            creator: rule.creator?.fullname || '',
            status: rule.status?.name || 'Неизвестно',
            statusCode: rule.status?.code || 'unknown',
            category: rule.category?.name || '',
          };
          rules.push(ruleItem);
        });

        setDataSource(rules);
      })
      .catch((error) => {
        console.error('Error loading rules:', error);
        setDataSource([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, currentPage, pageSize, loading]);

  // Эффекты
  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const addNewRule = () => {
    navigate('new');
  };

  // Вспомогательные функции
  const getStatusBadgeClass = (statusCode?: string): string => {
    switch (statusCode?.toLowerCase()) {
      case 'active':
      case 'published':
        return 'active';
      case 'draft':
        return 'draft';
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
  const activeRules = dataSource.filter(rule =>
    rule.statusCode?.toLowerCase() === 'active' ||
    rule.statusCode?.toLowerCase() === 'published'
  ).length;

  const draftRules = dataSource.filter(rule =>
    rule.statusCode?.toLowerCase() === 'draft'
  ).length;

  return (
    <div className="rules-page">
      {/* Заголовок */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-icon">
              <FileTextOutlined />
            </div>
            <div className="header-text">
              <Title level={1} className="page-title">
                Правила сообщества
              </Title>
              <Text type="secondary" className="page-subtitle">
                Управление правилами и регламентами сообщества
              </Text>
            </div>
          </div>

          <div className="header-actions">
            <Space size="small">
              <Button
                type="default"
                icon={<PlusCircleOutlined />}
                onClick={addNewRule}
                className="action-button"
                style={{
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '13px',
                  height: '36px',
                }}
              >
                Новое правило
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

      {/* Основной контент */}
      <div className="page-content">
        <div className="content-container">
          {/* Статистика */}
          {!loading && (
            <Card className="stats-card" size="small">
              <Space split={<span className="stats-divider">•</span>} wrap>
                <Text type="secondary">
                  Всего правил: <Text strong>{total}</Text>
                </Text>
                {hasFilters && (
                  <Text type="secondary">
                    Найдено: <Text strong style={{ color: '#722ed1' }}>{dataSource.length}</Text>
                  </Text>
                )}
                {activeRules > 0 && (
                  <Text type="secondary">
                    Активных: <Text strong style={{ color: '#52c41a' }}>{activeRules}</Text>
                  </Text>
                )}
                {draftRules > 0 && (
                  <Text type="secondary">
                    Черновиков: <Text strong style={{ color: '#fa8c16' }}>{draftRules}</Text>
                  </Text>
                )}
                {hasFilters && (
                  <Text type="secondary">
                    Фильтров: <Text strong style={{ color: '#1890ff' }}>{activeFiltersCount}</Text>
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
                Загрузка правил...
              </Text>
            </div>
          )}

          {/* Пустое состояние */}
          {!loading && !dataSource.length && (
            <Card className="empty-state-card">
              <Empty
                description={
                  hasFilters
                    ? "По заданным фильтрам правила не найдены"
                    : "В сообществе пока нет правил"
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
                    onClick={addNewRule}
                    style={{ marginTop: '16px' }}
                  >
                    Создать первое правило
                  </Button>
                )}
              </Empty>
            </Card>
          )}

          {/* Список правил */}
          {!loading && dataSource.length > 0 && (
            <div className="rules-list">
              <List
                itemLayout="vertical"
                dataSource={dataSource}
                pagination={false}
                renderItem={(item: RuleCardInterface, index) => (
                  <div
                    key={item.id}
                    className="rule-row-wrapper"
                    style={{
                      animationDelay: `${0.1 + (index * 0.05)}s`
                    }}
                  >
                    <List.Item>
                      <Card
                        onClick={() => navigate(item.id)}
                        className="rule-card"
                        hoverable
                      >
                        <div className="rule-info">
                          <div className="rule-header">
                            <div className="rule-main">
                              <div className="rule-title">{item.title}</div>
                              {item.description && (
                                <div className="rule-description">{item.description}</div>
                              )}
                            </div>
                            <div className="rule-status">
                              <span className={`status-badge ${getStatusBadgeClass(item.statusCode)}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <div className="rule-meta">
                            <div className="rule-details">
                              {item.creator && (
                                <div className="meta-item">
                                  <UserOutlined className="meta-icon" />
                                  <span className="meta-value">{item.creator}</span>
                                </div>
                              )}
                              {item.category && (
                                <div className="meta-item">
                                  <TagOutlined className="meta-icon" />
                                  <span className="meta-value">{item.category}</span>
                                </div>
                              )}
                            </div>
                            {item.tracker && (
                              <div className="rule-tracker">
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
          className="rules-pagination"
        />
      )}

      {/* Модальное окно фильтров */}
      <ResourceFilterModal
        communityId={props.communityId}
        resource="rule"
        visible={showFilters}
        onCancel={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}