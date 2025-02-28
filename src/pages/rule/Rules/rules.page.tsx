import {
  Button,
  Card,
  ConfigProvider,
  Flex,
  Layout,
  List,
  Pagination,
  Space,
  Typography,
} from 'antd';
import { RuleCardInterface } from 'src/interfaces';
import Meta from 'antd/es/card/Meta';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { CrudDataSourceService } from 'src/services';
import { RuleModel } from 'src/models';
import { FilterOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ruRU from 'antd/lib/locale/ru_RU';

export function Rules(props: any) {
  const maxPageSize = 20;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as RuleCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);

  const addNewRule = () => {
    navigate('new', { preventScrollReset: true });
  };

  const loadData = useCallback(() => {
    if (loading) {
      const ruleService = new CrudDataSourceService(RuleModel);
      ruleService
        .list(
          [
            {
              field: 'community_id',
              op: 'equals',
              val: props.communityId,
            },
          ],
          undefined,
          { skip: currentPage, limit: pageSize },
          ['creator', 'status', 'category']
        )
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
  }, [currentPage, loading, pageSize, props.communityId]);

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
    <Layout style={{ height: '100%', overflowY: 'auto' }}>
      <Space
        style={{
          justifyContent: 'space-between',
          alignContent: 'center',
          marginLeft: '30%',
          marginRight: '30%',
        }}
      >
        <Typography.Title
          level={3}
          style={{
            minWidth: 120,
            alignContent: 'center',
          }}
        >
          Правила сообщества
        </Typography.Title>
        <Flex>
          <Button type="text" onClick={addNewRule}>
            <PlusCircleOutlined style={{ fontSize: 20 }} />
            Новое правило
          </Button>
          <Button type="text" style={{ marginLeft: 10 }}>
            <FilterOutlined style={{ fontSize: 20 }} />
            Фильтры
          </Button>
        </Flex>
      </Space>

      <List
        itemLayout="vertical"
        dataSource={dataSource}
        loading={loading}
        locale={{ emptyText: 'Ещё нет ни одного правила' }}
        pagination={
          dataSource.length >= 20
            ? {
                position: 'bottom',
                align: 'end',
              }
            : false
        }
        size="large"
        style={{
          display: 'inline-flex',
          justifyContent: 'center',
        }}
        renderItem={(item: RuleCardInterface) => (
          <List.Item
            style={{
              width: '40vw',
              cursor: 'pointer',
            }}
          >
            <Card
              onClick={() => {
                navigate(item.id, {});
              }}
              style={{ height: 280 }}
            >
              <Meta title={item.title} description={item.description} />
              <div style={{ marginTop: 20 }}>
                <strong>Автор:</strong> {item.creator}
              </div>
              <div style={{ marginTop: 10 }}>
                <strong>Категория:</strong> {item.category}
              </div>
              <div style={{ marginTop: 10 }}>
                <strong>Статус:</strong> {item.status}
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
            style={{ marginTop: 16, textAlign: 'center' }}
          />
        </ConfigProvider>
      )}
    </Layout>
  );
}
