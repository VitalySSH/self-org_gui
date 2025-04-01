import { Layout, List, Typography, Empty, Breadcrumb } from 'antd';
import { TableMyMemberRequest } from 'src/interfaces';
import { RequestMemberAoService } from 'src/services';
import { useCallback, useEffect, useState } from 'react';
import styles from 'src/shared/assets/scss/module/list.module.scss';
import './my-add-member-requests.page.scss';
import { MyMemberRequestCard } from 'src/components';

const { Title } = Typography;

type NavigationState = {
  currentLevel: number;
  breadcrumbs: { id: string; name: string }[];
  currentData: TableMyMemberRequest[];
};

export function MyAddMemberRequests() {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<TableMyMemberRequest[]>([]);
  const [navState, setNavState] = useState<NavigationState>({
    currentLevel: 1,
    breadcrumbs: [],
    currentData: [],
  });
  // const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const requestMemberAoService = new RequestMemberAoService();
      const resp = await requestMemberAoService.myList();

      setDataSource(resp.data);
      setNavState({
        currentLevel: 1,
        breadcrumbs: [],
        currentData: resp.data,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShowSubcommunities = (item: TableMyMemberRequest) => {
    if (!item.children || item.children.length === 0) return;

    setNavState((prev) => ({
      currentLevel: prev.currentLevel + 1,
      breadcrumbs: [
        ...prev.breadcrumbs,
        { id: item.key, name: item.communityName },
      ],
      currentData: item.children || [],
    }));
  };

  const handleGoBack = () => {
    setNavState({
      currentLevel: 1,
      breadcrumbs: [],
      currentData: dataSource,
    });
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) return handleGoBack();

    const newBreadcrumbs = navState.breadcrumbs.slice(0, index);
    const parentItem = newBreadcrumbs[newBreadcrumbs.length - 1];

    const findData = (
      items: TableMyMemberRequest[],
      targetId: string
    ): TableMyMemberRequest[] => {
      for (const item of items) {
        if (item.key === targetId) return item.children || [];
        if (item.children) {
          const found = findData(item.children, targetId);
          if (found.length) return found;
        }
      }
      return [];
    };

    setNavState({
      currentLevel: index + 1,
      breadcrumbs: newBreadcrumbs,
      currentData: findData(dataSource, parentItem.id),
    });
  };

  return (
    <Layout className={styles.container}>
      <div className={styles.header}>
        <Title level={3} className={styles.title}>
          Мои заявки на вступление в сообщества
        </Title>
        {/*{navState.currentLevel === 1 && (*/}
        {/*  <div className={styles.buttons}>*/}
        {/*    <Button type="text" onClick={() => setShowFilters(true)}>*/}
        {/*      <Badge count={0} offset={[5, 0]}>*/}
        {/*        <FilterOutlined style={{ fontSize: 20 }} />*/}
        {/*      </Badge>*/}
        {/*      Фильтры*/}
        {/*    </Button>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>

      <div
        className="content-wrapper"
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '0 16px',
          width: '100%',
        }}
      >
        {navState.currentLevel > 1 && (
          <Breadcrumb
            items={navState.breadcrumbs.map((crumb, index) => ({
              title: (
                <span
                  className="breadcrumb-item"
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {crumb.name}
                </span>
              ),
              key: crumb.id,
            }))}
            className="custom-breadcrumbs"
          />
        )}

        <List
          itemLayout="vertical"
          dataSource={navState.currentData}
          loading={loading}
          locale={{ emptyText: <Empty description="Заявки не найдены" /> }}
          className={styles.list}
          renderItem={(item) => (
            <List.Item className={styles.listItem}>
              <MyMemberRequestCard
                item={item}
                setLoading={setLoading}
                onShowSubCommunities={handleShowSubcommunities}
              />
            </List.Item>
          )}
        />
      </div>
    </Layout>
  );
}
