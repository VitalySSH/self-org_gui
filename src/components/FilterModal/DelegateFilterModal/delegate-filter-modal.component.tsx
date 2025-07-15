import { Button, Form, Modal } from 'antd';
import { FilterModalProps, Pagination } from 'src/interfaces';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { CategoryModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { CustomSelect } from 'src/components';
import { CategorySelectedCode, DelegateLabel } from 'src/consts';

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
      op: 'equals',
      val: CategorySelectedCode,
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

  const onClearForm = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Фильтры"
      open={visible}
      onCancel={onClearForm}
      footer={[
        <Button key="reset" type="primary" onClick={handleReset}>
          Сбросить
        </Button>,
        <Button key="apply" type="primary" onClick={() => form.submit()}>
          Найти
        </Button>,
      ]}
    >
      <Form
        name="delegsteFilterModalForm"
        form={form}
        onFinish={onApply}
        layout="vertical"
      >
        <Form.Item label="Категория" name="category">
          <CustomSelect
            bindLabel="name"
            formField="category"
            requestOptions={fetchCategories}
            onChange={onCustomSelectChange}
            label="Выберите категорию"
            enableSearch={true}
          />
        </Form.Item>

        <Form.Item label={DelegateLabel} name="delegate">
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
    </Modal>
  );
}
