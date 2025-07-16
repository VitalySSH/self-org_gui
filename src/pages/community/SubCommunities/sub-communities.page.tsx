
import { Badge, Button, List } from 'antd';
import { CommunityCardInterface, FilterValues } from 'src/interfaces';
import { CommunityCard, CommunityFilterModal } from 'src/components';
import { useCallback, useEffect, useState } from 'react';
import { CommunityAOService } from 'src/services';
import { FilterOutlined } from '@ant-design/icons';

export function SubCommunities(props: any) {
  const communityId = props?.communityId;

  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as CommunityCardInterface[]);
  const [filter, setFilter] = useState<{ title?: string; content?: string }>(
    {}
  );
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(() => {
    if (loading) {
      const communityService = new CommunityAOService();
      communityService
        .getSubCommunities(communityId)
        .then((items) => {
          const data = items.filter((it) => {
            const isTitle =
              !filter.title || it.title.toLowerCase().includes(filter.title);
            const isContent =
              !filter.content ||
              it.title.toLowerCase().includes(filter.content);

            return isTitle && isContent;
          });
          setDataSource(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [communityId, loading, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilters = (values: FilterValues) => {
    const newFilter: { title?: string; content?: string } = {};
    if (values.title) newFilter['title'] = values.title.toLowerCase();
    if (values.content) newFilter['content'] = values.content.toLowerCase();
    if (Object.keys(newFilter).length) {
      setFilter(newFilter);
      setLoading(true);
      setShowFilters(false);
      loadData();
    }
  };

  const handleResetFilters = () => {
    setFilter({});
    setLoading(true);
    setShowFilters(false);
    loadData();
  };

  return (
    <div className="workspace-list-page">
      <div className="workspace-list-header">
        <h2 className="workspace-page-title">Внутренние сообщества</h2>

        <div className="workspace-list-actions">
          <Button
            type="text"
            onClick={() => setShowFilters(true)}
            className="workspace-filter-button"
          >
            <Badge
              count={Object.keys(filter).length}
              size="small"
              className="workspace-filter-badge"
            >
              <FilterOutlined className="workspace-filter-icon" />
            </Badge>
            Фильтры
          </Button>
        </div>
      </div>

      <CommunityFilterModal
        visible={showFilters}
        onCancel={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <div className="workspace-list-content">
        <List
          itemLayout="vertical"
          dataSource={dataSource}
          loading={loading}
          locale={{ emptyText: 'Нет сообществ' }}
          pagination={
            dataSource.length >= 20
              ? {
                position: 'bottom',
                align: 'end',
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} из ${total} сообществ`,
              }
              : false
          }
          className="workspace-list"
          renderItem={(item: CommunityCardInterface) => (
            <List.Item className="workspace-list-item">
              <CommunityCard key={item.id} item={item} actions={[]} />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}