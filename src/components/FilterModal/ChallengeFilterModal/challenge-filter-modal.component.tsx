import { Button, Form, Input, Modal } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { FilterModalProps, Pagination } from 'src/interfaces';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { CategoryModel, StatusModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { CustomSelect } from 'src/components';
import {
  CategorySelectedCode,
  ChallengeAtWorkCode,
  ChallengeSolvedCode,
  NewChallengeCode,
  SystemCategoryCode,
} from 'src/consts';

export function ChallengeFilterModal({
  communityId,
  visible,
  onCancel,
  onApply,
  onReset,
}: FilterModalProps) {
  const [form] = Form.useForm();

  const statusService = new CrudDataSourceService(StatusModel);
  const categoryService = new CrudDataSourceService(CategoryModel);
  const authApiClientService = new AuthApiClientService();

  const loadStatuses = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'code',
      op: 'in',
      val: [NewChallengeCode, ChallengeAtWorkCode, ChallengeSolvedCode],
    });

    return statusService.list(newFilters, undefined, pagination);
  };

  const loadUsers = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    return authApiClientService.communityListUsers(
      communityId,
      newFilters,
      undefined,
      pagination
    );
  };

  const loadCategories = async (pagination?: Pagination, filters?: Filters) => {
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
      title={
        <div>
          <FilterOutlined className="filter-modal-icon" />
          Фильтры
        </div>
      }
      open={visible}
      onCancel={onClearForm}
      footer={[
        <Button key="reset" onClick={handleReset}>
          Сбросить
        </Button>,
        <Button key="apply" type="primary" onClick={() => form.submit()}>
          Применить фильтры
        </Button>,
      ]}
      className="filter-modal"
      width={550}
      centered
      destroyOnClose
      styles={{
        body: {
          maxHeight: 'calc(85vh - 108px)',
          overflowY: 'auto',
          padding: 0,
        },
      }}
    >
      <div className="filter-modal-content">
        <Form
          name="challengeFilterModalForm"
          form={form}
          onFinish={onApply}
          layout="vertical"
          className="filter-form"
        >
          <Form.Item
            label="Название задачи"
            name="title"
            tooltip="Поиск будет выполнен по названию задачи"
          >
            <Input placeholder="Поиск по названию" />
          </Form.Item>

          <Form.Item
            label="Статус"
            name="status"
            tooltip="Выберите статус для фильтрации"
          >
            <CustomSelect
              bindLabel="name"
              formField="status"
              requestOptions={loadStatuses}
              onChange={onCustomSelectChange}
              label="Выберите статус"
              enableSearch={true}
            />
          </Form.Item>

          <Form.Item
            label="Категория"
            name="category"
            tooltip="Выберите категорию для фильтрации задач"
          >
            <CustomSelect
              bindLabel="name"
              formField="category"
              requestOptions={loadCategories}
              onChange={onCustomSelectChange}
              label="Выберите категорию"
              enableSearch={true}
            />
          </Form.Item>

          <Form.Item
            label="Автор"
            name="creator"
            tooltip="Выберите участника сообщества для фильтрации по авторству"
          >
            <CustomSelect
              bindLabel="fullname"
              formField="creator"
              requestOptions={loadUsers}
              onChange={onCustomSelectChange}
              label="Выберите автора"
              enableSearch={true}
            />
          </Form.Item>

          <Form.Item
            label="Описание задачи"
            name="description"
            tooltip="Поиск будет выполнен по фрагменту описания"
          >
            <Input.TextArea placeholder="Поиск по описанию" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
