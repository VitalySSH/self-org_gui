import { Button, Form, message, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  AuthContextProvider,
  DelegateFormInterface,
  Pagination,
} from 'src/interfaces';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  CategoryLabel,
  CategorySelectedCode,
  DelegateLabel,
  SystemCategoryCode,
} from 'src/consts';
import { CustomSelect } from 'src/components';
import { CategoryModel, DelegateSettingsModel } from 'src/models';
import { useAuth } from 'src/hooks';
import { Filters } from 'src/shared/types.ts';

export function NewDelegate(props: any) {
  const communityId = props.communityId;
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();

  const categoryIds = (location.state?.categoryIds as string[]) || [];
  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const authApiClientService = new AuthApiClientService();
  const categoryService = new CrudDataSourceService(CategoryModel);

  const [form] = Form.useForm();

  const successInfo = (content: string) => {
    messageApi
      .open({
        type: 'success',
        content: content,
      })
      .then();
  };

  const errorInfo = (content: string) => {
    messageApi
      .open({
        type: 'error',
        content: content,
      })
      .then();
  };

  const onCustomSelectChange = (fieldName: string, value: any) => {
    form.setFieldValue(fieldName, value);
  };

  const handleFormChange = () => {
    const formData = form.getFieldsValue();
    const isValid = Boolean(formData.category) && Boolean(formData.delegate);
    setDisabled(!isValid);
  };

  const fetchCategories = async (
    pagination?: Pagination,
    filters?: Filters,
  ) => {
    const newFilters: Filters = filters || [];
    newFilters.push(
      {
        field: 'community_id',
        op: 'equals',
        val: communityId,
      }
    );
    newFilters.push(
      {
        field: 'status.code',
        op: 'in',
        val: [CategorySelectedCode, SystemCategoryCode],
      }
    );

    if (categoryIds) {
      newFilters.push({
        field: 'id',
        op: 'notin',
        val: categoryIds,
      });
    }

    return categoryService.list(newFilters, undefined, pagination);
  };

  const fetchUsers = async (
    pagination?: Pagination,
    filters?: Filters,
  ) => {
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

  const onCancel = () => {
    navigate(-1);
  };

  const onFinish = () => {
    setButtonLoading(true);
    const delegateService = new CrudDataSourceService(DelegateSettingsModel);
    const formData: DelegateFormInterface = form.getFieldsValue();
    const delegateSettings = delegateService.createRecord();
    delegateSettings.category = formData.category;
    delegateSettings.delegate = formData.delegate;
    delegateSettings.community_id = communityId;
    delegateSettings.user_id = authData.user?.id;

    delegateService
      .save(delegateSettings)
      .then(() => {
        successInfo('Выбор делегата сохранён');
        navigate(-1);
      })
      .catch((error) => {
        errorInfo(`Ошибка создания нстроек делегата: ${error}`);
      })
      .finally(() => setButtonLoading(false));
  };

  return (
    <>
      <div className="form-container">
        {contextHolder}
        <div className="form-header">Новый делегат</div>
        <Form
          form={form}
          name="new-delegate-settings"
          onFieldsChange={handleFormChange}
        >
          <Form.Item
            name="category"
            label={
              <span>
                {CategoryLabel}&nbsp;
                <Tooltip title="Выберите категорию, для которой хотите назначить делегата.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, выберите категорию',
              },
            ]}
            hasFeedback
          >
            <CustomSelect
              requestOptions={fetchCategories}
              onChange={onCustomSelectChange}
              formField="category"
              bindLabel="name"
              enableSearch={true}
            />
          </Form.Item>
          <Form.Item
            name="delegate"
            label={
              <span>
                {DelegateLabel}&nbsp;
                <Tooltip title="Выберите делегата, голос которого станет вашим голосом в голосованиях в выбранной выше категории.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, выберите делегата',
              },
            ]}
            hasFeedback
          >
            <CustomSelect
              requestOptions={fetchUsers}
              onChange={onCustomSelectChange}
              formField="delegate"
              bindLabel="fullname"
              enableSearch={true}
            />
          </Form.Item>
        </Form>
      </div>
      <div className="toolbar">
        <Button
          type="primary"
          htmlType="submit"
          loading={buttonLoading}
          onClick={onFinish}
          disabled={disabled}
          className="toolbar-button"
        >
          Сохранить выбор
        </Button>
        <Button
          type="primary"
          htmlType="button"
          onClick={onCancel}
          className="toolbar-button"
        >
          Назад
        </Button>
      </div>
    </>
  );
}
