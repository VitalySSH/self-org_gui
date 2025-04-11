import { Badge, Button, Layout, List, Pagination, Typography } from 'antd';
import { CrudDataSourceService } from 'src/services';
import { CommunityModel, RequestMemberModel } from 'src/models';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import {
  AuthContextProvider,
  CommunityCardInterface,
  FilterValues,
} from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { CommunityCard, CommunityFilterModal } from 'src/components';
import styles from 'src/shared/assets/scss/module/list.module.scss';
import { Filters } from 'src/shared/types.ts';
import { FilterOutlined } from '@ant-design/icons';

export function AllCommunities() {
  const maxPageSize = 20;
  const authData: AuthContextProvider = useAuth();
  const currentUserId = authData.user?.id;

  const getBaseFilters = (): Filters => {
    return [
      {
        field: 'parent_id',
        op: 'null',
        val: true,
      },
    ];
  };

  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as CommunityCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(() => {
    if (loading) {
      const communityService = new CrudDataSourceService(CommunityModel);
      communityService
        .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
          'user_settings.user',
          'main_settings.name',
          'main_settings.description',
        ])
        .then((resp) => {
          setTotal(resp.total);
          const items: CommunityCardInterface[] = [];
          const communityIds = resp.data.map((com) => com.id);
          const requestMemberService = new CrudDataSourceService(
            RequestMemberModel
          );
          requestMemberService
            .list(
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
            )
            .then((res) => {
              const memberRequests = res.data;
              resp.data.forEach((community) => {
                const isMyCommunity =
                  (community.user_settings || []).filter(
                    (ucs) => ucs.user?.id === currentUserId
                  ).length > 0;
                const isAddRequest =
                  memberRequests.filter(
                    (rm) => rm.community?.id === community.id
                  ).length > 0;
                const item = {
                  id: community.id || '',
                  title: community.main_settings?.name?.name || '',
                  description:
                    community.main_settings?.description?.value || '',
                  members: (community.user_settings || []).length,
                  isMyCommunity: isMyCommunity || isAddRequest,
                };
                items.push(item);
              });
              setDataSource(items);
            });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentUserId, currentPage, loading, pageSize, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = (
    page: SetStateAction<number>,
    size: SetStateAction<number>
  ) => {
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

    if (newFilters.length > 1) {
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
          Все сообщества
        </Typography.Title>

        <div className={styles.buttons}>
          <Button type="text" onClick={() => setShowFilters(true)}>
            <Badge count={filters.length - 1}>
              <FilterOutlined style={{ fontSize: 20 }} />
            </Badge>
            Фильтры
          </Button>
        </div>
      </div>

      <CommunityFilterModal
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
        locale={{ emptyText: 'Нет сообществ' }}
        pagination={false}
        className={styles.list}
        renderItem={(item: CommunityCardInterface) => (
          <List.Item className={styles.listItem}>
            <CommunityCard key={item.id} item={item} actions={[]} />
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
          className="pagination"
        />
      )}
    </Layout>
  );
}
