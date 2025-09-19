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
} from 'antd';
import { FilterOutlined, UserAddOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  AuthContextProvider,
  MemberRequestCardItem,
  MemberRequestFilterValues,
} from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { RequestMemberModel } from 'src/models';
import { useAuth } from 'src/hooks';
import { useNavigate } from 'react-router-dom';
import { Filters } from 'src/shared/types.ts';
import {
  MemberRequestFilterModal,
  MemberRequestVoteCard,
} from 'src/components';
import './common-add-member-requests.page.scss';

const { Title, Text } = Typography;

interface CommonAddMemberRequestsProps {
  communityId: string;
}

export function CommonAddMemberRequests({
  communityId,
}: CommonAddMemberRequestsProps) {
  const maxPageSize = 20;
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const currentUserId = authData.user?.id;

  const getBaseFilters = (): Filters => {
    return [
      {
        field: 'community_id',
        op: 'equals',
        val: communityId,
      },
      {
        field: 'parent_id',
        op: 'null',
        val: true,
      },
    ];
  };

  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<MemberRequestCardItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    if (!loading || !communityId) return;

    try {
      const memberRequestService = new CrudDataSourceService(
        RequestMemberModel
      );
      const resp = await memberRequestService.list(
        filters,
        undefined,
        { skip: currentPage, limit: pageSize },
        ['status', 'member']
      );

      setTotal(resp.total);
      const items: MemberRequestCardItem[] = resp.data.map((requestMember) => {
        const isMyRequest = requestMember.member?.id === currentUserId;
        return {
          key: requestMember.id || '',
          member: requestMember.member?.fullname || '',
          reason: requestMember.reason || '',
          status: requestMember.status?.name || '',
          created: moment(requestMember.created).format('DD.MM.yyyy HH:mm'),
          isMyRequest: isMyRequest,
          vote: requestMember.vote,
          decision:
            requestMember.vote === true
              ? 'Одобрена'
              : requestMember.vote === false
                ? 'Отклонена'
                : 'Нет',
        };
      });
      setDataSource(items);
    } catch (error) {
      console.error('Error loading member requests:', error);
      navigate('/no-much-page');
    } finally {
      setLoading(false);
    }
  }, [
    currentUserId,
    communityId,
    loading,
    navigate,
    filters,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilters = (values: MemberRequestFilterValues) => {
    const newFilters: Filters = getBaseFilters();

    if (values.status) {
      newFilters.push({
        field: 'status.id',
        op: 'equals',
        val: values.status.id,
      });
    }

    if (values.requestMember) {
      newFilters.push({
        field: 'member.id',
        op: 'equals',
        val: values.requestMember.member?.id,
      });
    }

    if (values.decision !== undefined) {
      newFilters.push({
        field: 'vote',
        op: 'equals',
        val: values.decision,
      });
    }

    if (values.created !== undefined) {
      const dates = [
        values.created[0].format('YYYY-MM-DD'),
        values.created[1].format('YYYY-MM-DD'),
      ];
      newFilters.push({
        field: 'created',
        op: 'between',
        val: JSON.stringify(dates),
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

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  const renderHeader = () => (
    <div className="page-header">
      <div className="header-content">
        <div className="header-main">
          <div className="header-icon">
            <UserAddOutlined />
          </div>
          <div className="header-text">
            <Title level={1} className="page-title">
              Заявки на вступление
            </Title>
            <Text type="secondary" className="page-subtitle">
              Рассмотрение и голосование по заявкам участников
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
              count={filters.length - 2}
              size="small"
              offset={[8, -2]}
              style={{
                backgroundColor: filters.length > 2 ? '#cc0000' : '#999',
                fontSize: '10px',
              }}
            >
              <span style={{ marginLeft: filters.length > 2 ? '12px' : '0' }}>
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

    const activeFiltersCount = filters.length - 2;
    const hasFilters = activeFiltersCount > 0;

    return (
      <Card className="stats-card" size="small">
        <Space split={<span className="stats-divider">•</span>}>
          <Text type="secondary">
            Заявок: <Text strong>{total}</Text>
          </Text>
          <Text type="secondary">
            Страница: <Text strong>{currentPage}</Text>
          </Text>
          {hasFilters && (
            <Text type="secondary">
              Фильтров:{' '}
              <Text strong style={{ color: '#cc0000' }}>
                {activeFiltersCount}
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
            Загрузка заявок...
          </Text>
        </div>
      );
    }

    if (!dataSource.length) {
      return (
        <Card className="empty-state-card">
          <Empty
            description={
              filters.length > 2
                ? 'По заданным фильтрам заявки не найдены'
                : 'В сообществе пока нет заявок на вступление'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <div className="requests-list">
        {dataSource.map((item) => (
          <div key={item.key} className="request-card-wrapper">
            <MemberRequestVoteCard
              item={item}
              setLoading={setLoading}
              isParent={true}
            />
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
            `${range[0]}-${range[1]} из ${total} заявок`
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
    <div className="common-add-member-requests-page">
      {renderHeader()}

      <div className="page-content">
        <div className="content-container">
          {renderStats()}
          {renderContent()}
          {renderPagination()}
        </div>
      </div>

      <MemberRequestFilterModal
        communityId={communityId}
        resource="rule"
        visible={showFilters}
        onCancel={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        currentUserId={currentUserId}
      />
    </div>
  );
}
