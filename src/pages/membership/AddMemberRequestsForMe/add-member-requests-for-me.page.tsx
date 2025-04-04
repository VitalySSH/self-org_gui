import {
  Badge,
  Button,
  Empty,
  Layout,
  List,
  Pagination,
  Typography,
} from 'antd';
import styles from 'src/shared/assets/scss/module/list.module.scss';
import moment from 'moment';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import {
  AuthContextProvider,
  MemberRequestFilterValues,
  TableMemberRequest,
} from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { RequestMemberModel } from 'src/models';
import { FilterOutlined } from '@ant-design/icons';
import { useAuth } from 'src/hooks';
import { useNavigate } from 'react-router-dom';
import { Filters } from 'src/shared/types.ts';
import {
  MemberRequestFilterModal,
  MemberRequestVoteCard,
} from 'src/components';

export function AddMemberRequestsForMe(props: any) {
  const maxPageSize = 20;
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const currentUserId = authData.user?.id;
  const communityId = props?.communityId;

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
        val: false,
      },
    ];
  };

  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as TableMemberRequest[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(() => {
    if (loading && communityId) {
      const memberRequestService = new CrudDataSourceService(
        RequestMemberModel
      );
      memberRequestService
        .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
          'status',
          'member',
        ])
        .then((resp) => {
          setTotal(resp.total);
          const items: TableMemberRequest[] = [];
          resp.data.forEach((requestMember) => {
            const isMyRequest = requestMember.member?.id === currentUserId;
            const item = {
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
            items.push(item);
          });
          setDataSource(items);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [communityId, currentUserId, loading, navigate]);

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
    if (values.member) {
      newFilters.push({
        field: 'member.id',
        op: 'equals',
        val: values.member.id,
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
      ]
      newFilters.push({
        field: 'created',
        op: 'between',
        val: JSON.stringify(dates),
      });
    }
    if (newFilters.length > 2) {
      setFilters(newFilters);
      setCurrentPage(1);
      setLoading(true);
      setShowFilters(false);
    }
  };

  const handlePageChange = (
    page: SetStateAction<number>,
    size: SetStateAction<number>
  ) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  return (
    <Layout className={styles.container}>
      <div className={styles.header}>
        <Typography.Title level={3} className={styles.title}>
          Заявки на вступление
        </Typography.Title>

        <div className={styles.buttons}>
          <Button type="text" onClick={() => setShowFilters(true)}>
            <Badge count={filters.length - 2}>
              <FilterOutlined style={{ fontSize: 20 }} />
            </Badge>
            Фильтры
          </Button>
        </div>
      </div>

      <MemberRequestFilterModal
        communityId={props.communityId}
        resource="rule"
        visible={showFilters}
        onCancel={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={() => {
          setFilters(getBaseFilters());
          setCurrentPage(1);
          setLoading(true);
          setShowFilters(false);
        }}
      />

      <List
        itemLayout="vertical"
        dataSource={dataSource}
        loading={loading}
        locale={{ emptyText: <Empty description="Заявки не найдены" /> }}
        className={styles.list}
        renderItem={(item) => (
          <List.Item className={styles.listItem}>
            <MemberRequestVoteCard item={item} setLoading={setLoading} />
          </List.Item>
        )}
      />
      {total > pageSize && (
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
          defaultPageSize={maxPageSize}
          showTotal={(total, range) => `${range[0]}-${range[1]} из ${total}`}
          className={styles.pagination}
        />
      )}
    </Layout>
  );
}
