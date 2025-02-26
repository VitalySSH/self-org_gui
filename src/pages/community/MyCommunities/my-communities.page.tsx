import { ConfigProvider, List, Pagination } from 'antd';
import { SetStateAction, useEffect, useState } from 'react';
import { CommunityAOService } from 'src/services';
import { AuthContextProvider, CommunityCardInterface } from 'src/interfaces';
import { CommunityCard } from 'src/components';
import { useAuth } from 'src/hooks';
import ruRU from 'antd/lib/locale/ru_RU';

export function MyCommunities() {
  const maxPageSize = 20;
  const authData: AuthContextProvider = useAuth();
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as CommunityCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);

  const communityService = new CommunityAOService();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = () => {
    if (loading) {
      communityService
        .myList(undefined, undefined, { skip: currentPage, limit: pageSize }, [
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
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData, currentPage, pageSize]);

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
      <div className="page-header">Мои сообщества</div>
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
