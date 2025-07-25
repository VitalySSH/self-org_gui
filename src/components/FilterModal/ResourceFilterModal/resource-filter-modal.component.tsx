import { Button, DatePicker, Form, Input, Modal, Switch } from 'antd';
import { FilterOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { FilterModalProps, Pagination } from 'src/interfaces';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { StatusModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { CustomSelect } from 'src/components';
import {
  InitiativeApprovedCode,
  InitiativeRevokedCode,
  OnConsiderationCode,
  PrincipalAgreementCode,
  RuleApprovedCode,
  RuleRevokedCode,
} from 'src/consts';
import { useState } from 'react';

export function ResourceFilterModal({
  communityId,
  visible,
  onCancel,
  onApply,
  onReset,
  resource,
}: FilterModalProps) {
  const [form] = Form.useForm();

  const statusService = new CrudDataSourceService(StatusModel);
  const authApiClientService = new AuthApiClientService();
  const [isOneDayEvent, setIsOneDayEvent] = useState(false);

  const loadStatuses = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    switch (resource) {
      case 'rule':
        newFilters.push({
          field: 'code',
          op: 'in',
          val: [
            OnConsiderationCode,
            PrincipalAgreementCode,
            RuleApprovedCode,
            RuleRevokedCode,
          ],
        });
        break;
      case 'initiative':
        newFilters.push({
          field: 'code',
          op: 'in',
          val: [
            OnConsiderationCode,
            PrincipalAgreementCode,
            InitiativeApprovedCode,
            InitiativeRevokedCode,
          ],
        });
        break;
    }

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
    setIsOneDayEvent(false);
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
          padding: 0
        }
      }}
    >
      <div className="filter-modal-content">
        <Form
          name="resourceFilterModalForm"
          form={form}
          onFinish={onApply}
          layout="vertical"
          className="filter-form"
        >
          <Form.Item
            label="Наименование"
            name="title"
            tooltip="Поиск будет выполнен по названию"
          >
            <Input placeholder="Поиск по названию" />
          </Form.Item>

          <Form.Item
            label="Описание"
            name="content"
            tooltip="Поиск будет выполнен по фрагменту описания"
          >
            <Input.TextArea placeholder="Поиск по описанию" />
          </Form.Item>

          {resource === 'initiative' && (
            <>
              <Form.Item label="Однодневное событие" name="isOneDayEvent">
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  value={isOneDayEvent}
                  onChange={(value) => setIsOneDayEvent(value)}
                />
              </Form.Item>
              {isOneDayEvent && (
                <Form.Item label="Дата события" name="eventDate">
                  <DatePicker format="DD.MM.YYYY" />
                </Form.Item>
              )}
            </>
          )}

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
        </Form>
      </div>
    </Modal>
);
}
