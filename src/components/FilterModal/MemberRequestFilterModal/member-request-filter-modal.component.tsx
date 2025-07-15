import { Button, DatePicker, Form, Modal, Select } from 'antd';
import { FilterModalProps, Pagination } from 'src/interfaces';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { StatusModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { CustomSelect } from 'src/components';
import { AbstainedCode, VotedCode, VotedByDefaultCode } from 'src/consts';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export function MemberRequestFilterModal({
  communityId,
  visible,
  onCancel,
  onApply,
  onReset,
}: FilterModalProps) {
  const [form] = Form.useForm();

  const statusService = new CrudDataSourceService(StatusModel);
  const authApiClientService = new AuthApiClientService();

  const loadStatuses = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'code',
      op: 'in',
      val: [VotedCode, AbstainedCode, VotedByDefaultCode],
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
        name="memberRequestFilterModalForm"
        form={form}
        onFinish={onApply}
        layout="vertical"
      >
        <Form.Item label="Участник сообщества" name="member">
          <CustomSelect
            bindLabel="fullname"
            formField="member"
            requestOptions={loadUsers}
            onChange={onCustomSelectChange}
            label="Выберите автора"
            enableSearch={true}
          />
        </Form.Item>

        <Form.Item name="decision" label="Выберите решение">
          <Select placeholder="Решение" allowClear>
            <Select.Option value={true}>Одобрена</Select.Option>
            <Select.Option value={false}>Отклонена</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Статус" name="status">
          <CustomSelect
            bindLabel="name"
            formField="status"
            requestOptions={loadStatuses}
            onChange={onCustomSelectChange}
            label="Выберите статус"
            enableSearch={true}
          />
        </Form.Item>

        <Form.Item name="created" label="Дата подачи">
          <RangePicker
            style={{ width: '100%' }}
            format="DD.MM.YYYY"
            presets={[
              { label: 'Сегодня', value: [dayjs(), dayjs()] },
              {
                label: 'Этот месяц',
                value: [dayjs().startOf('month'), dayjs().endOf('month')],
              },
              {
                label: 'Последние 30 дней',
                value: [dayjs().subtract(30, 'days'), dayjs()],
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
