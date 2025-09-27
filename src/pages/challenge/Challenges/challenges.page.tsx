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
  ExperimentOutlined,
  UserOutlined,
  TagOutlined,
  TeamOutlined,
  SolutionOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FilterValues, ChallengeCardInterface } from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { ChallengeModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { ChallengeFilterModal } from 'src/components';
import './challenges.page.scss';

const { Title, Text } = Typography;

interface ChallengesProps {
  communityId: string;
}

export function Challenges(props: ChallengesProps) {
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
  const [dataSource, setDataSource] = useState<ChallengeCardInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  // Загрузка данных
  const fetchChallenges = useCallback(() => {
    if (!loading) return;

    const challengeService = new CrudDataSourceService(ChallengeModel);
    challengeService
      .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
        'creator',
        'status',
        'category',
        'solutions',
      ])
      .then((resp) => {
        setTotal(resp.total);
        const challenges: ChallengeCardInterface[] = [];

        resp.data.forEach((challenge) => {
          const completedSolutions = (challenge.solutions || []).filter(
            (solution) =>
              solution.status === 'ready_for_review' ||
              solution.status === 'completed'
          );

          const challengeItem: ChallengeCardInterface = {
            id: challenge.id || '',
            title: challenge.title || 'Без названия',
            description: challenge.description
              ? challenge.description.slice(0, 200) +
                (challenge.description.length > 200 ? '...' : '')
              : '',
            creator: challenge.creator?.fullname || '',
            status: challenge.status?.name || 'Неизвестно',
            statusCode: challenge.status?.code || 'unknown',
            category: challenge.category?.name || '',
            participantsCount: (challenge.solutions || []).filter(
              (s) => s.user_id !== challenge.creator?.id
            ).length,
            solutionsCount: completedSolutions.length,
          };
          challenges.push(challengeItem);
        });

        setDataSource(challenges);
      })
      .catch((error) => {
        console.error('Error loading challenges:', error);
        setDataSource([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, currentPage, pageSize, loading]);

  // Эффекты
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

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

    if (values.description) {
      newFilters.push({
        field: 'description',
        op: 'ilike',
        val: values.description,
      });
    }

    if (values.category) {
      newFilters.push({
        field: 'category.id',
        op: 'equals',
        val: values.category.id,
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

  const addNewChallenge = () => {
    navigate('new');
  };

  // Вспомогательные функции
  const getStatusBadgeClass = (statusCode?: string): string => {
    switch (statusCode?.toLowerCase()) {
      case 'новая':
      case 'new':
        return 'new';
      case 'в работе':
      case 'in-progress':
      case 'active':
        return 'in-progress';
      case 'решена':
      case 'solved':
      case 'completed':
        return 'solved';
      case 'архивная':
      case 'archived':
        return 'archived';
      default:
        return 'new';
    }
  };

  // Вычисляемые значения
  const activeFiltersCount = filters.length - getBaseFilters().length;
  const hasFilters = activeFiltersCount > 0;

  // Статистика
  const newChallenges = dataSource.filter(
    (challenge) =>
      challenge.statusCode?.toLowerCase() === 'новая' ||
      challenge.statusCode?.toLowerCase() === 'new'
  ).length;

  const inProgressChallenges = dataSource.filter(
    (challenge) =>
      challenge.statusCode?.toLowerCase() === 'в работе' ||
      challenge.statusCode?.toLowerCase() === 'in-progress' ||
      challenge.statusCode?.toLowerCase() === 'active'
  ).length;

  const solvedChallenges = dataSource.filter(
    (challenge) =>
      challenge.statusCode?.toLowerCase() === 'решена' ||
      challenge.statusCode?.toLowerCase() === 'solved' ||
      challenge.statusCode?.toLowerCase() === 'completed'
  ).length;

  // const totalParticipants = dataSource.reduce(
  //   (sum, challenge) => sum + challenge.participantsCount,
  //   0
  // );
  // const totalSolutions = dataSource.reduce(
  //   (sum, challenge) => sum + challenge.solutionsCount,
  //   0
  // );

  return (
    <div className="challenges-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-icon">
              <ExperimentOutlined />
            </div>
            <div className="header-text">
              <Title level={1} className="page-title">
                Лаборатория сообщества
              </Title>
              <Text type="secondary" className="page-subtitle">
                Коллективное решение сложных задач с помощью ИИ и совместной работы участников
              </Text>
            </div>
          </div>

          <div className="header-actions">
            <Space size="small">
              <Button
                type="default"
                icon={<PlusCircleOutlined />}
                onClick={addNewChallenge}
                className="action-button"
                style={{
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '13px',
                  height: '36px',
                }}
              >
                Создать задачу
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
                  Всего задач: <Text strong>{total}</Text>
                </Text>
                {hasFilters && (
                  <Text type="secondary">
                    Найдено:{' '}
                    <Text strong style={{ color: '#6366f1' }}>
                      {dataSource.length}
                    </Text>
                  </Text>
                )}
                {newChallenges > 0 && (
                  <Text type="secondary">
                    Новых:{' '}
                    <Text strong style={{ color: '#6366f1' }}>
                      {newChallenges}
                    </Text>
                  </Text>
                )}
                {inProgressChallenges > 0 && (
                  <Text type="secondary">
                    В работе:{' '}
                    <Text strong style={{ color: '#fa8c16' }}>
                      {inProgressChallenges}
                    </Text>
                  </Text>
                )}
                {solvedChallenges > 0 && (
                  <Text type="secondary">
                    Решено:{' '}
                    <Text strong style={{ color: '#52c41a' }}>
                      {solvedChallenges}
                    </Text>
                  </Text>
                )}
                {/*{totalParticipants > 0 && (*/}
                {/*  <Text type="secondary">*/}
                {/*    Участников:{' '}*/}
                {/*    <Text strong style={{ color: '#722ed1' }}>*/}
                {/*      {totalParticipants}*/}
                {/*    </Text>*/}
                {/*  </Text>*/}
                {/*)}*/}
                {/*{totalSolutions > 0 && (*/}
                {/*  <Text type="secondary">*/}
                {/*    Решений:{' '}*/}
                {/*    <Text strong style={{ color: '#1890ff' }}>*/}
                {/*      {totalSolutions}*/}
                {/*    </Text>*/}
                {/*  </Text>*/}
                {/*)}*/}
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
                Загрузка задач...
              </Text>
            </div>
          )}

          {/* Пустое состояние */}
          {!loading && !dataSource.length && (
            <Card className="empty-state-card">
              <Empty
                description={
                  hasFilters
                    ? 'По заданным фильтрам задачи не найдены'
                    : 'В лаборатории пока нет задач'
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
                    onClick={addNewChallenge}
                    style={{ marginTop: '16px' }}
                  >
                    Создать первую задачу
                  </Button>
                )}
              </Empty>
            </Card>
          )}

          {/* Список задач */}
          {!loading && dataSource.length > 0 && (
            <div className="challenges-list">
              <List
                itemLayout="vertical"
                dataSource={dataSource}
                pagination={false}
                renderItem={(item: ChallengeCardInterface, index) => (
                  <div
                    key={item.id}
                    className="challenge-row-wrapper"
                    style={{
                      animationDelay: `${0.1 + index * 0.05}s`,
                    }}
                  >
                    <List.Item>
                      <Card
                        onClick={() => navigate(item.id)}
                        className="challenge-card"
                        hoverable
                      >
                        <div className="challenge-info">
                          <div className="challenge-header">
                            <div className="challenge-main">
                              <div className="challenge-title">
                                {item.title}
                              </div>
                              {item.description && (
                                <div className="challenge-description">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <div className="challenge-status">
                              <span
                                className={`status-badge ${getStatusBadgeClass(item.statusCode)}`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <div className="challenge-meta">
                            <div className="challenge-details">
                              {item.creator && (
                                <div className="meta-item">
                                  <UserOutlined className="meta-icon" />
                                  <span className="meta-value">
                                    {item.creator}
                                  </span>
                                </div>
                              )}
                              {item.category && (
                                <div className="meta-item category">
                                  <TagOutlined className="meta-icon" />
                                  <span className="meta-value">
                                    {item.category}
                                  </span>
                                </div>
                              )}
                              <div className="meta-item participants">
                                <TeamOutlined className="meta-icon" />
                                <span className="meta-value">
                                  {item.participantsCount} участн.
                                </span>
                              </div>
                              <div className="meta-item solutions">
                                <SolutionOutlined className="meta-icon" />
                                <span className="meta-value">
                                  {item.solutionsCount} решений
                                </span>
                              </div>
                            </div>
                            {/*<div className="challenge-priority">*/}
                            {/*  #{item.id.slice(-6)}*/}
                            {/*</div>*/}
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
          className="challenges-pagination"
        />
      )}

      {/* Модальное окно фильтров */}
      <ChallengeFilterModal
        communityId={props.communityId}
        visible={showFilters}
        onCancel={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
}
