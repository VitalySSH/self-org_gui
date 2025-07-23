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
import { useNavigate } from 'react-router-dom';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import {
  AuthContextProvider,
  DelegateCardInterface,
  DelegateFilterValues,
} from 'src/interfaces';
import { Filters } from 'src/shared/types.ts';
import { CrudDataSourceService } from 'src/services';
import { CategoryModel, DelegateSettingsModel } from 'src/models';
import { useAuth } from 'src/hooks';
import {
  FilterOutlined,
  PlusCircleOutlined,
  UserOutlined,
  TeamOutlined,
  TagOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { DelegateFilterModal } from 'src/components';
import { CategorySelectedCode, SystemCategoryCode } from 'src/consts';
import './my-delegates.page.scss';

const { Title, Text } = Typography;

export function MyDelegates(props: any) {
  const maxPageSize = 20;
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();

  const getBaseFilters = (): Filters => {
    return [
      {
        field: 'community_id',
        op: 'equals',
        val: props.communityId,
      },
      {
        field: 'user_id',
        op: 'equals',
        val: authData.user?.id,
      },
    ];
  };

  const [loading, setLoading] = useState(true);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState([] as DelegateCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  const addNewDelegate = () => {
    navigate('new', { state: { categoryIds } });
  };

  const fetchDelegateSettings = useCallback(() => {
    if (loading) {
      const delegateService = new CrudDataSourceService(DelegateSettingsModel);
      delegateService
        .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
          'delegate',
          'category',
        ])
        .then((resp) => {
          setTotal(resp.total);
          const delegates: DelegateCardInterface[] = [];
          const _categoryIds: string[] = [];
          resp.data.forEach((settings) => {
            const delegateSettings = {
              id: settings.id,
              category: settings.category?.name,
              userFullName: settings.delegate?.fullname,
            };
            delegates.push(delegateSettings);
            if (settings.category?.id) _categoryIds.push(settings.category.id);
          });
          setDataSource(delegates);
          setCategoryIds(_categoryIds);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [filters, currentPage, loading, pageSize]);

  const fetchCategoriesId = useCallback(() => {
    if (categoryCount === null) {
      const categoryService = new CrudDataSourceService(CategoryModel);
      const filters: Filters = [
        {
          field: 'community_id',
          op: 'equals',
          val: props.communityId,
        },
        {
          field: 'status.code',
          op: 'in',
          val: [CategorySelectedCode, SystemCategoryCode],
        },
      ];
      categoryService
        .list(filters, undefined, { skip: 1, limit: 1 })
        .then((resp) => {
          setCategoryCount(resp.total);
        });
    }
  }, [props.communityId]);

  useEffect(() => {
    fetchDelegateSettings();
    fetchCategoriesId();
  }, [fetchDelegateSettings, fetchCategoriesId]);

  const handlePageChange = (
    page: SetStateAction<number>,
    size: SetStateAction<number>
  ) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  const handleApplyFilters = (values: DelegateFilterValues) => {
    const newFilters: Filters = getBaseFilters();
    if (values.category) {
      newFilters.push({
        field: 'category.id',
        op: 'equals',
        val: values.category.id,
      });
    }
    if (values.delegate) {
      newFilters.push({
        field: 'delegate.id',
        op: 'equals',
        val: values.delegate.id,
      });
    }

    if (newFilters.length > 2) {
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

  const renderHeader = () => (
    <div className="page-header">
      <div className="header-content">
        <div className="header-main">
          <div className="header-icon">
            <TeamOutlined />
          </div>
          <div className="header-text">
            <Title level={1} className="page-title">
              Мои советники
            </Title>
            <Text type="secondary" className="page-subtitle">
              Управление доверенными советниками и их полномочиями
            </Text>
          </div>
        </div>

        <div className="header-actions">
          <Space size="small">
            {(categoryIds || []).length < (categoryCount || 0) && (
              <Button
                type="default"
                icon={<PlusCircleOutlined />}
                onClick={addNewDelegate}
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
                count={filters.length - 2}
                size="small"
                offset={[8, -2]}
                style={{
                  backgroundColor: (filters.length - 2) > 0 ? '#52c41a' : '#999',
                  fontSize: '10px',
                }}
              >
                <span style={{ marginLeft: (filters.length - 2) > 0 ? '12px' : '0' }}>
                  Фильтры
                </span>
              </Badge>
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );

  const renderStats = () => {
    if (loading) return null;

    const activeFiltersCount = filters.length - 2;
    const hasFilters = activeFiltersCount > 0;
    const totalDelegates = total;
    const availableSlots = (categoryCount || 0) - (categoryIds || []).length;

    return (
      <Card className="stats-card" size="small">
        <Space split={<span className="stats-divider">•</span>} wrap>
          <Text type="secondary">
            Всего советников: <Text strong>{totalDelegates}</Text>
          </Text>
          {hasFilters && (
            <Text type="secondary">
              Найдено: <Text strong style={{ color: '#cc0000' }}>{dataSource.length}</Text>
            </Text>
          )}
          {availableSlots > 0 && (
            <Text type="secondary">
              Доступно слотов: <Text strong style={{ color: '#52c41a' }}>{availableSlots}</Text>
            </Text>
          )}
          {hasFilters && (
            <Text type="secondary">
              Фильтров: <Text strong style={{ color: '#1890ff' }}>{activeFiltersCount}</Text>
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
            Загрузка советников...
          </Text>
        </div>
      );
    }

    if (!dataSource.length) {
      const isFiltered = filters.length > 2;
      const availableSlots = (categoryCount || 0) - (categoryIds || []).length;

      return (
        <Card className="empty-state-card">
          <Empty
            description={
              isFiltered
                ? "По заданным фильтрам советники не найдены"
                : "У вас пока нет назначенных советников"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '20px 0' }}
          >
            {isFiltered ? (
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleResetFilters}
                style={{ marginTop: '16px' }}
              >
                Сбросить фильтры
              </Button>
            ) : (
              availableSlots > 0 && (
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={addNewDelegate}
                  style={{ marginTop: '16px' }}
                >
                  Добавить первого советника
                </Button>
              )
            )}
          </Empty>
        </Card>
      );
    }

    return (
      <div className="delegates-list">
        <List
          itemLayout="vertical"
          dataSource={dataSource}
          pagination={false}
          renderItem={(item: DelegateCardInterface, index) => (
            <div
              key={item.id}
              className="delegate-row-wrapper"
              style={{
                animationDelay: `${0.1 + (index * 0.05)}s`
              }}
            >
              <List.Item>
                <Card
                  onClick={() => navigate(item.id)}
                  className="delegate-card"
                  hoverable
                >
                  <div className="delegate-info">
                    <div className="info-row">
                      <div className="info-icon">
                        <TagOutlined />
                      </div>
                      <div className="info-content">
                        <div className="info-label">Категория</div>
                        <div className="info-value">{item.category}</div>
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-icon">
                        <UserOutlined />
                      </div>
                      <div className="info-content">
                        <div className="info-label">Доверенный советник</div>
                        <div className="info-value">{item.userFullName}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            </div>
          )}
        />
      </div>
    );
  };

  return (
    <div className="my-delegates-page">
      {renderHeader()}

      <div className="page-content">
        <div className="content-container">
          {renderStats()}
          {renderContent()}
        </div>
      </div>

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
          className="delegates-pagination"
        />
      )}

      <DelegateFilterModal
        communityId={props.communityId}
        visible={showFilters}
        onCancel={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}