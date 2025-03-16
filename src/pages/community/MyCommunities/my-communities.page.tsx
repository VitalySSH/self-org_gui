import {
  Badge,
  Button,
  Layout,
  List,
  Pagination,
  Typography,
} from 'antd';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { CommunityAOService } from 'src/services';
import {
  AuthContextProvider,
  CommunityCardInterface,
  FilterValues,
} from 'src/interfaces';
import { CommunityCard, CommunityFilterModal } from 'src/components';
import { useAuth } from 'src/hooks';
import styles from 'src/shared/assets/scss/module/list.module.scss';
import { FilterOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Filters } from 'src/shared/types.ts';

export function MyCommunities() {
  const maxPageSize = 20;
  const navigate = useNavigate();

  const authData: AuthContextProvider = useAuth();
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as CommunityCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>([]);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(() => {
    if (loading) {
      const communityService = new CommunityAOService();
      communityService
        .myList(filters, undefined, { skip: currentPage, limit: pageSize }, [
          'user_settings.user',
          'main_settings.name',
          'main_settings.description',
        ])
        .then((resp) => {
          setTotal(resp.total);
          const communities: CommunityCardInterface[] = [];
          resp.data.forEach((community) => {
            const settings = (community.user_settings || []).filter(
              (settings) => settings.user?.id === authData.user?.id
            );
            const isBlocked = settings.length ? settings[0].is_blocked : false;
            const communityItem = {
              id: community.id,
              title: community.main_settings?.name?.name || '',
              description: community.main_settings?.description?.value || '',
              members: (community.user_settings || []).length,
              isBlocked: isBlocked,
              isMyCommunity: true,
            };
            communities.push(communityItem);
          });
          setDataSource(communities);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authData.user?.id, currentPage, loading, pageSize, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addNewCommunity = () => {
    navigate('/new-community');
  };

  const handlePageChange = (
    page: SetStateAction<number>,
    size: SetStateAction<number>
  ) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  const handleApplyFilters = (values: FilterValues) => {
    const newFilters: Filters = [];
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

    if (newFilters.length) {
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
          Мои сообщества
        </Typography.Title>

        <div className={styles.buttons}>
          <Button type="text" onClick={addNewCommunity}>
            <PlusCircleOutlined style={{ fontSize: 20 }} />
            Новое сообщество
          </Button>
          <Button type="text" onClick={() => setShowFilters(true)}>
            <Badge count={filters.length}>
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
          setFilters([]);
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
            <CommunityCard
              key={item.id}
              item={item} actions={[]}
            />
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
