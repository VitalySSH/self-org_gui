import {
  Badge,
  Button,
  Card,
  Layout,
  List,
  Pagination,
  Typography
} from "antd";
import { useNavigate } from "react-router-dom";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import {
  AuthContextProvider,
  DelegateCardInterface,
  DelegateFilterValues,
} from "src/interfaces";
import { Filters } from "src/shared/types.ts";
import { CrudDataSourceService } from "src/services";
import { CategoryModel, DelegateSettingsModel } from "src/models";
import { useAuth } from "src/hooks";
import styles from 'src/shared/assets/scss/module/list.module.scss';
import {
  FilterOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { DelegateFilterModal } from "src/components";
import { CategorySelectedCode } from "src/consts";

export function MyDelegates(props: any) {
  const maxPageSize = 20;
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();

  const getBaseFilters = (): Filters => {
    return [
      {
        field: 'community_id',
        op: 'equals',
        val: props.communityId,
      },
      {
        field: 'user_id',
        op: 'equals',
        val: authData.user?.id,
      },
    ];
  };

  const [loading, setLoading] = useState(true);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState([] as DelegateCardInterface[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(maxPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(getBaseFilters());
  const [showFilters, setShowFilters] = useState(false);

  const addNewDelegate = () => {
    navigate('new', { state: { categoryIds} });
  };

  const fetchDelegateSettings = useCallback(() => {
    if (loading) {
      const delegateService =
        new CrudDataSourceService(DelegateSettingsModel);
      delegateService
        .list(filters, undefined, { skip: currentPage, limit: pageSize }, [
          'delegate',
          'category',
        ])
        .then((resp) => {
          setTotal(resp.total);
          const delegates: DelegateCardInterface[] = [];
          const _categoryIds: string[] = [];
          resp.data.forEach((settings) => {
            const delegateSettings = {
              id: settings.id,
              category: settings.category?.name,
              userFullName: settings.delegate?.fullname,
            };
            delegates.push(delegateSettings);
            if (settings.category?.id) _categoryIds.push(settings.category.id);
          });
          setDataSource(delegates);
          setCategoryIds(_categoryIds);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [filters, currentPage, loading, pageSize]);

  const fetchCategoriesId = useCallback(() => {
    if (categoryCount === null) {
      const categoryService =
        new CrudDataSourceService(CategoryModel);
      const filters: Filters = [
        {
          field: 'community_id',
          op: 'equals',
          val: props.communityId,
        },
        {
          field: 'status.code',
          op: 'equals',
          val: CategorySelectedCode,
        },
      ];
      categoryService
        .list(filters, undefined, { skip: 1, limit: 1 })
        .then((resp) => {
          setCategoryCount(resp.total);
        });
    }
  }, [props.communityId]);

  useEffect(() => {
    fetchDelegateSettings();
    fetchCategoriesId();
  }, [fetchDelegateSettings, fetchCategoriesId]);

  const handlePageChange = (
    page: SetStateAction<number>,
    size: SetStateAction<number>
  ) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  const handleApplyFilters = (values: DelegateFilterValues) => {
    const newFilters: Filters = getBaseFilters();
    if (values.category) {
      newFilters.push({
        field: 'category.id',
        op: 'equals',
        val: values.category.id,
      });
    }
    if (values.delegate) {
      newFilters.push({
        field: 'delegate.id',
        op: 'equals',
        val: values.delegate.id,
      });
    }

    if (newFilters.length > 2) {
      setFilters(newFilters);
      setCurrentPage(1);
      setLoading(true);
      setShowFilters(false);
    }
  }

  return (
    <Layout className={styles.container}>
      <div className={styles.header}>
        <Typography.Title level={3} className={styles.title}>
          Мои делегаты
        </Typography.Title>

        <div className={styles.buttons}>
          {(categoryIds || []).length < (categoryCount || 0) && (
            <Button type="text" onClick={addNewDelegate}>
              <PlusCircleOutlined style={{ fontSize: 20 }} />
              Добавить делегата
            </Button>
          )}
          <Button type="text" onClick={() => setShowFilters(true)}>
            <Badge count={filters.length - 2}>
              <FilterOutlined style={{ fontSize: 20 }} />
            </Badge>
            Фильтры
          </Button>
        </div>
      </div>

      <DelegateFilterModal
        communityId={props.communityId}
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
        locale={{ emptyText: 'Не найдено ни одного делегата' }}
        pagination={false}
        className={styles.list}
        renderItem={(item: DelegateCardInterface) => (
          <List.Item className={styles.listItem}>
            <Card
              onClick={() => navigate(item.id)}
              className={styles.delegateCard}
            >
              <div>
                <strong>Категория:</strong> {item.category}
              </div>
              <div style={{ marginTop: 10 }}>
                <strong>Делегат:</strong> {item.userFullName}
              </div>
            </Card>
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

