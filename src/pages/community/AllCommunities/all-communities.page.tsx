import { ConfigProvider, List, Pagination } from 'antd';
import { CrudDataSourceService } from 'src/services';
import { CommunityModel } from 'src/models';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { AuthContextProvider, CommunityCardInterface } from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { CommunityCard } from 'src/components';
import ruRU from 'antd/lib/locale/ru_RU';

export function AllCommunities() {
  const maxPageSize = 20;
  const authData: AuthContextProvider = useAuth();
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as CommunityCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);

  const loadData = useCallback(() => {
    if (loading) {
      const communityService = new CrudDataSourceService(CommunityModel);
      communityService
        .list(
          [
            {
              field: 'parent_id',
              op: 'null',
              val: true,
            },
          ],
          undefined,
          { skip: currentPage, limit: pageSize },
          [
            'user_settings.user',
            'main_settings.name',
            'main_settings.description',
            'main_settings.adding_members.creator',
          ]
        )
        .then((resp) => {
          setTotal(resp.total);
          const items: CommunityCardInterface[] = [];
          resp.data.forEach((community) => {
            const isMyCommunity =
              (community.user_settings || []).filter(
                (ucs) => ucs.user?.id === authData.user?.id
              ).length > 0;
            const isAddRequest =
              (community.main_settings?.adding_members || []).filter(
                (rm) => rm.member?.id === authData.user?.id
              ).length > 0;
            const item = {
              id: community.id || '',
              title: community.main_settings?.name?.name || '',
              description: community.main_settings?.description?.value || '',
              members: (community.user_settings || []).length,
              isMyCommunity: isMyCommunity || isAddRequest,
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
  }, [authData.user?.id, currentPage, loading, pageSize]);

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

  return (
    <div className="communities-list">
      <div className="page-header">Все сообщества</div>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        itemLayout="vertical"
        dataSource={dataSource}
        loading={loading}
        locale={{ emptyText: 'Нет сообществ' }}
        size="large"
        renderItem={(item: CommunityCardInterface) => (
          <List.Item>
            <CommunityCard key={item.id} item={item} actions={[]} />
          </List.Item>
        )}
      />
      {total > pageSize && (
        <ConfigProvider locale={ruRU}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['10', '20', '50', '100']}
            defaultPageSize={maxPageSize}
            showTotal={(total, range) => `${range[0]}-${range[1]} из ${total}`}
            style={{ marginTop: 16, textAlign: 'center' }}
          />
        </ConfigProvider>
      )}
    </div>
  );
}
