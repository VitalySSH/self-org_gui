import {
  Badge,
  Button,
  Empty,
  Layout,
  List,
  Typography,
} from 'antd';
import styles from 'src/shared/assets/scss/module/list.module.scss';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import {
  AuthContextProvider,
  FilterValues,
  TableMemberRequest,
} from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { RequestMemberModel } from 'src/models';
import {
  FilterOutlined,
} from '@ant-design/icons';
import { useAuth } from 'src/hooks';
import { useNavigate } from 'react-router-dom';
import { Filters } from 'src/shared/types.ts';
import {
  ResourceFilterModal
} from 'src/components/ResourceFilterModal/resource-filter-modal.component.tsx';
import {
  MemberRequestVoteCard
} from 'src/components/MemberRequest/MemberRequestVoteCard/member-request-vote-card.component.tsx';

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
      const memberRequestService = new CrudDataSourceService(RequestMemberModel);
      memberRequestService
        .list(filters,undefined, undefined, ['status', 'member'])
        .then((resp) => {
          const items: TableMemberRequest[] = [];
          (resp.data).forEach((requestMember) => {
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

  const handleApplyFilters = (values: FilterValues) => {
    const newFilters: Filters = getBaseFilters();
    if (values.title) {
      newFilters.push({
        field: 'title',
        op: 'ilike',
        val: values.title,
      });
    }
    if (newFilters.length > 2) {
      setFilters(newFilters);
      setCurrentPage(1);
      setLoading(true);
      setShowFilters(false);
    }
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

      <ResourceFilterModal
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
            <MemberRequestVoteCard
              item={item}
              setLoading={setLoading}
            />
          </List.Item>
        )}
      />
    </Layout>
  );
}
