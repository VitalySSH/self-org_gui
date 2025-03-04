import {
  Badge,
  Button,
  Card,
  ConfigProvider,
  Flex,
  Layout,
  List,
  Pagination,
  Typography,
} from 'antd';
import { FilterValues, RuleCardInterface } from 'src/interfaces';
import Meta from 'antd/es/card/Meta';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { CrudDataSourceService } from 'src/services';
import { RuleModel } from 'src/models';
import { FilterOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ruRU from 'antd/lib/locale/ru_RU';
import { Filters } from 'src/shared/types.ts';
import { ResourceFilterModal } from 'src/components/ResourceFilterModal/resource-filter-modal.component.tsx';
import { StatusTag } from 'src/components/StatusTag/status-tag.component';
import styles from 'src/shared/assets/scss/module/list.module.scss';

export function Rules(props: any) {
  const maxPageSize = 20;
  const navigate = useNavigate();

  const getBaseFilters = (): Filters => {
    return [
      {
        field: 'community_id',
        op: 'equals',
        val: props.communityId,
      },
    ];
  };

  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as RuleCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  const addNewRule = () => {
    navigate('new', { preventScrollReset: true });
  };

  const loadData = useCallback(() => {
    if (loading) {
      const ruleService = new CrudDataSourceService(RuleModel);
      ruleService
        .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
          'creator',
          'status',
          'category',
        ])
        .then((resp) => {
          setTotal(resp.total);
          const rules: RuleCardInterface[] = [];
          resp.data.forEach((rule) => {
            const ruleItem = {
              id: rule.id,
              title: rule.title,
              description: rule.content,
              creator: rule.creator?.fullname,
              status: rule.status?.name,
              statusCode: rule.status?.code,
              category: rule.category?.name,
            };
            rules.push(ruleItem);
          });
          setDataSource(rules);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [filters, currentPage, loading, pageSize]);

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
        field: 'title',
        op: 'ilike',
        val: values.title,
      });
    }
    if (values.content) {
      newFilters.push({
        field: 'content',
        op: 'ilike',
        val: values.content,
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
          Правила сообщества
        </Typography.Title>

        <div className={styles.buttons}>
          <Button type="text" onClick={addNewRule}>
            <PlusCircleOutlined style={{ fontSize: 20 }} />
            Новое правило
          </Button>
          <Button type="text" onClick={() => setShowFilters(true)}>
            <Badge count={filters.length - 1}>
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
        locale={{ emptyText: 'Не найдено ни одного правила' }}
        pagination={false}
        className={styles.list}
        renderItem={(item: RuleCardInterface) => (
          <List.Item className={styles.listItem}>
            <Card
              onClick={() => navigate(item.id)}
              className={styles.card}
            >
              <Meta
                title={item.title}
                description={item.description}
              />
              <div style={{ marginTop: 20 }}>
                <strong>Автор:</strong> {item.creator}
              </div>
              <div style={{ marginTop: 10 }}>
                <strong>Категория:</strong> {item.category}
              </div>
              <div style={{ marginTop: 10 }}>
                <Flex align="center" gap={8}>
                  <strong>Статус:</strong>
                  <StatusTag
                    status={item.status || ''}
                    statusCode={item.statusCode || ''}
                  />
                </Flex>
              </div>
            </Card>
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
            className={styles.pagination}
          />
        </ConfigProvider>
      )}
    </Layout>
  );
}
