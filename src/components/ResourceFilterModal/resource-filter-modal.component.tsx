import { Button, DatePicker, Form, Input, Modal, Switch } from "antd";
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
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

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

  const loadStatuses = async (pagination?: Pagination) => {
    const filters: Filters = [];
    switch (resource) {
      case 'rule':
        filters.push({
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
        filters.push({
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

    return statusService.list(filters, undefined, pagination);
  };

  const loadUsers = async (pagination?: Pagination) => {
    const filters: Filters = [];
    return authApiClientService.communityListUsers(
      communityId,
      filters,
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
  }

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
        name="filterModalForm"
        form={form}
        onFinish={onApply}
        layout="vertical"
      >
        <Form.Item label="Наименование" name="title">
          <Input placeholder="Поиск по названию" />
        </Form.Item>

        <Form.Item label="Описание" name="content">
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
                <DatePicker format="YYYY-MM-DD" />
              </Form.Item>
            )}
          </>
        )}

        <Form.Item label="Статус" name="status">
          <CustomSelect
            bindLabel="name"
            formField="status"
            requestOptions={loadStatuses}
            onChange={onCustomSelectChange}
            label="Выберите статус"
          />
        </Form.Item>

        <Form.Item label="Автор" name="creator">
          <CustomSelect
            bindLabel="fullname"
            formField="creator"
            requestOptions={loadUsers}
            onChange={onCustomSelectChange}
            label="Выберите автора"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
