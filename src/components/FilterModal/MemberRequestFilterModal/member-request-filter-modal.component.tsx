import { Button, DatePicker, Form, Modal, Select } from 'antd';
import {
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { FilterModalProps, Pagination } from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { RequestMemberModel, StatusModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { CustomSelect } from 'src/components';
import {
  AbstainedCode,
  VotedCode,
  VotedByDefaultCode,
  CommunityMemberCode,
  MemberExcludedCode,
} from 'src/consts';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export function MemberRequestFilterModal({
  communityId,
  visible,
  onCancel,
  onApply,
  onReset,
  currentUserId,
  withoutCurrentUser = false,
}: FilterModalProps) {
  const [form] = Form.useForm();

  const statusService = new CrudDataSourceService(StatusModel);
  const memberRequestService = new CrudDataSourceService(RequestMemberModel);

  const loadStatuses = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'code',
      op: 'in',
      val: [
        CommunityMemberCode,
        MemberExcludedCode,
        VotedCode,
        AbstainedCode,
        VotedByDefaultCode,
      ],
    });

    return statusService.list(newFilters, undefined, pagination);
  };

  const loadRequestMembers = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    const newFilters: Filters = filters || [];
    const baseFilters: Filters = [
      {
        field: 'community_id',
        op: 'equals',
        val: communityId,
      },
      {
        field: 'parent_id',
        op: 'null',
        val: true,
      },
    ];
    if (withoutCurrentUser && currentUserId) {
      newFilters.push({
        field: 'member.id',
        op: 'ne',
        val: currentUserId,
      });
    }
    newFilters.push(...baseFilters);
    return memberRequestService.list(newFilters, undefined, pagination, [
      'member',
    ]);
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
      width={550}
      centered
      destroyOnHidden
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
          name="memberRequestFilterModalForm"
          form={form}
          onFinish={onApply}
          layout="vertical"
          className="filter-form"
        >
          <Form.Item
            label="Участник сообщества"
            name="requestMember"
            tooltip="Выберите участника сообщества для фильтрации заявок"
          >
            <CustomSelect
              bindLabel="member.fullname"
              formField="requestMember"
              requestOptions={loadRequestMembers}
              onChange={onCustomSelectChange}
              label="Выберите участника"
              enableSearch={true}
            />
          </Form.Item>

          <Form.Item
            name="decision"
            label="Решение по заявке"
            tooltip="Фильтрация по статусу одобрения заявки"
          >
            <Select placeholder="Выберите решение" allowClear size="large">
              <Select.Option value={true}>
                <CheckCircleOutlined
                  style={{ color: '#52c41a', marginRight: 8 }}
                />
                Одобрена
              </Select.Option>
              <Select.Option value={false}>
                <CloseCircleOutlined
                  style={{ color: '#ff4d4f', marginRight: 8 }}
                />
                Отклонена
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Статус обработки"
            name="status"
            tooltip="Текущий статус рассмотрения заявки"
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
            name="created"
            label="Период подачи заявки"
            tooltip="Выберите период, когда была подана заявка"
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              size="large"
              presets={[
                { label: 'Сегодня', value: [dayjs(), dayjs()] },
                {
                  label: 'Эта неделя',
                  value: [dayjs().startOf('week'), dayjs().endOf('week')],
                },
                {
                  label: 'Этот месяц',
                  value: [dayjs().startOf('month'), dayjs().endOf('month')],
                },
                {
                  label: 'Последние 30 дней',
                  value: [dayjs().subtract(30, 'days'), dayjs()],
                },
                {
                  label: 'Последние 3 месяца',
                  value: [dayjs().subtract(3, 'months'), dayjs()],
                },
              ]}
              placeholder={['Дата от', 'Дата до']}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
