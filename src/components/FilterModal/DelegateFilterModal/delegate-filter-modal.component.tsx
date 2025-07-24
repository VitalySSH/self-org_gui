import { Button, Form, Modal } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { FilterModalProps, Pagination } from 'src/interfaces';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { CategoryModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { CustomSelect } from 'src/components';
import {
  CategorySelectedCode,
  DelegateLabel,
  SystemCategoryCode,
} from 'src/consts';

export function DelegateFilterModal({
  communityId,
  visible,
  onCancel,
  onApply,
  onReset,
}: FilterModalProps) {
  const [form] = Form.useForm();

  const categoryService = new CrudDataSourceService(CategoryModel);
  const authApiClientService = new AuthApiClientService();

  const fetchCategories = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'community_id',
      op: 'equals',
      val: communityId,
    });
    newFilters.push({
      field: 'status.code',
      op: 'in',
      val: [CategorySelectedCode, SystemCategoryCode],
    });

    return categoryService.list(newFilters, undefined, pagination);
  };

  const fetchUsers = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    return authApiClientService.communityListUsers(
      communityId,
      newFilters,
      undefined,
      pagination,
      undefined,
      true
    );
  };

  const onCustomSelectChange = (fieldName: string, value: any) => {
    form.setFieldValue(fieldName, value);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div>
          <FilterOutlined className="filter-modal-icon" />
          Фильтры
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="reset" onClick={handleReset}>
          Сбросить
        </Button>,
        <Button key="apply" type="primary" onClick={() => form.submit()}>
          Применить фильтры
        </Button>,
      ]}
      className="filter-modal"
      width={500}
      centered
      destroyOnClose
      styles={{
        body: {
          maxHeight: 'calc(85vh - 108px)',
          overflowY: 'auto',
          padding: 0
        }
      }}
    >
      <div className="filter-modal-content">
        <Form
          name="delegateFilterModalForm"
          form={form}
          onFinish={onApply}
          layout="vertical"
          className="filter-form"
        >
          <Form.Item
            label="Категория"
            name="category"
            tooltip="Выберите категорию для фильтрации советников"
          >
            <CustomSelect
              bindLabel="name"
              formField="category"
              requestOptions={fetchCategories}
              onChange={onCustomSelectChange}
              label="Выберите категорию"
              enableSearch={true}
            />
          </Form.Item>

          <Form.Item
            label={DelegateLabel}
            name="delegate"
            tooltip="Выберите конкретного советника"
          >
            <CustomSelect
              bindLabel="fullname"
              formField="delegate"
              requestOptions={fetchUsers}
              onChange={onCustomSelectChange}
              label="Выберите доверенного советника"
              enableSearch={true}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}