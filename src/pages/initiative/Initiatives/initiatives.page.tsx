import { Badge, Button, Layout, List, Pagination, Typography } from 'antd';
import { FilterValues, InitiativeCardInterface } from 'src/interfaces';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { CrudDataSourceService } from 'src/services';
import { InitiativeModel } from 'src/models';
import { FilterOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Filters } from 'src/shared/types.ts';
import styles from 'src/shared/assets/scss/module/list.module.scss';
import dayjs from 'dayjs';
import { ResourceCard, ResourceFilterModal } from 'src/components';

export function Initiatives(props: any) {
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
  const [dataSource, setDataSource] = useState([] as InitiativeCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  const addNewInitiative = () => {
    navigate('new');
  };

  const fetchInitiatives = useCallback(() => {
    if (loading) {
      const initiativeService = new CrudDataSourceService(InitiativeModel);
      initiativeService
        .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
          'creator',
          'status',
          'category',
        ])
        .then((resp) => {
          setTotal(resp.total);
          const initiatives: InitiativeCardInterface[] = [];
          resp.data.forEach((initiative) => {
            const eventDate = initiative.event_date
              ? dayjs(initiative.event_date)
              : null;
            const initiativeItem = {
              id: initiative.id,
              title: initiative.title,
              description: initiative.content,
              tracker: initiative.tracker,
              creator: initiative.creator?.fullname,
              status: initiative.status?.name,
              statusCode: initiative.status?.code,
              category: initiative.category?.name,
              isOneDayEvent: Boolean(initiative.is_one_day_event),
              eventDate: eventDate ? eventDate.format('DD.MM.YYYY') : '',
            };
            initiatives.push(initiativeItem);
          });
          setDataSource(initiatives);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [filters, currentPage, loading, pageSize]);

  useEffect(() => {
    fetchInitiatives();
  }, [fetchInitiatives]);

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
    if (values.isOneDayEvent) {
      newFilters.push({
        field: 'is_one_day_event',
        op: 'equals',
        val: values.isOneDayEvent,
      });
    }
    if (values.eventDate) {
      newFilters.push({
        field: 'event_date',
        op: 'equals',
        val: values.eventDate.format('YYYY-MM-DD'),
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
          Инициативы сообщества
        </Typography.Title>

        <div className={styles.buttons}>
          <Button type="text" onClick={addNewInitiative}>
            <PlusCircleOutlined style={{ fontSize: 20 }} />
            Новая инициатива
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
        resource="initiative"
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
        locale={{ emptyText: 'Не найдено ни одной инициативы' }}
        pagination={false}
        className={styles.list}
        renderItem={(item: InitiativeCardInterface) => (
          <List.Item className={styles.listItem}>
            <ResourceCard item={item} />
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
