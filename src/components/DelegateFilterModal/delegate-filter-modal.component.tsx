import { Button, Form, Modal } from 'antd';
import { FilterModalProps, Pagination } from 'src/interfaces';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { CategoryModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { CustomSelect } from 'src/components';
import { CategorySelectedCode } from 'src/consts';

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

  const fetchCategories = async (pagination?: Pagination) => {
    const filters: Filters = [
      {
        field: 'community_id',
        op: 'equals',
        val: communityId,
      },
      {
        field: 'status.code',
        op: 'equals',
        val: CategorySelectedCode,
      },
    ];

    return categoryService.list(filters, undefined, pagination);
  };

  const fetchUsers = async (pagination?: Pagination) => {
    return authApiClientService.communityListUsers(
      communityId,
      undefined,
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
        <Button key="reset" onClick={handleReset}>
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
          />
        </Form.Item>

        <Form.Item label="Делегат" name="delegate">
          <CustomSelect
            bindLabel="fullname"
            formField="delegate"
            requestOptions={fetchUsers}
            onChange={onCustomSelectChange}
            label="Выберите делегата"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
