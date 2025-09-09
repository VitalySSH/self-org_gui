import { useState } from 'react';
import { Button, Card, Form, message, Tooltip, Typography } from 'antd';
import {
  QuestionCircleOutlined,
  TeamOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AuthContextProvider,
  DelegateFormInterface,
  Pagination,
} from 'src/interfaces';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
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
import './new-delegate.page.scss';

const { Title, Text } = Typography;

interface NewDelegateProps {
  communityId: string;
}

export function NewDelegate(props: NewDelegateProps) {
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();

  const categoryIds = (location.state?.categoryIds as string[]) || [];
  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [formProgress, setFormProgress] = useState(0);

  const authApiClientService = new AuthApiClientService();
  const categoryService = new CrudDataSourceService(CategoryModel);

  const [form] = Form.useForm();

  const successInfo = (content: string) => {
    messageApi.open({
      type: 'success',
      content: content,
    });
  };

  const errorInfo = (content: string) => {
    messageApi.open({
      type: 'error',
      content: content,
    });
  };

  const onCustomSelectChange = (fieldName: string, value: any) => {
    form.setFieldValue(fieldName, value);
    handleFormChange();
  };

  const handleFormChange = () => {
    const formData = form.getFieldsValue();
    const isValid = Boolean(formData.category) && Boolean(formData.delegate);
    setDisabled(!isValid);

    // Обновляем прогресс (2 обязательных поля: category и delegate)
    const requiredFields = ['category', 'delegate'];
    const filledFields = requiredFields.filter((field) =>
      Boolean(formData[field])
    );
    const progress = Math.round(
      (filledFields.length / requiredFields.length) * 100
    );
    setFormProgress(progress);
  };

  const fetchCategories = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'community_id',
      op: 'equals',
      val: props.communityId,
    });
    newFilters.push({
      field: 'status.code',
      op: 'in',
      val: [CategorySelectedCode, SystemCategoryCode],
    });

    if (categoryIds && categoryIds.length > 0) {
      newFilters.push({
        field: 'id',
        op: 'notin',
        val: categoryIds,
      });
    }

    return categoryService.list(newFilters, undefined, pagination);
  };

  const fetchUsers = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    return authApiClientService.communityListUsers(
      props.communityId,
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

  const onFinish = async () => {
    try {
      setButtonLoading(true);
      const delegateService = new CrudDataSourceService(DelegateSettingsModel);
      const formData: DelegateFormInterface = form.getFieldsValue();

      const delegateSettings = delegateService.createRecord();
      delegateSettings.category = formData.category;
      delegateSettings.delegate = formData.delegate;
      delegateSettings.community_id = props.communityId;
      delegateSettings.user_id = authData.user?.id;

      await delegateService.save(delegateSettings);
      successInfo('Советник успешно назначен');
      navigate(-1);
    } catch (error) {
      errorInfo(`Ошибка при создании настроек советника: ${error}`);
    } finally {
      setButtonLoading(false);
    }
  };

  const getFormStatus = () => {
    if (disabled) return 'Требуется заполнение';
    return 'Готово к назначению';
  };

  // const getSelectedCategory = () => {
  //   const formData = form.getFieldsValue();
  //   return formData.category?.name || 'Не выбрана';
  // };
  //
  // const getSelectedDelegate = () => {
  //   const formData = form.getFieldsValue();
  //   return formData.delegate?.fullname || 'Не выбран';
  // };
  //
  // const getAvailableCategoriesCount = () => {
  //   // Можно добавить логику для подсчета доступных категорий
  //   // Пока возвращаем статическое значение
  //   return categoryIds.length > 0 ? `Исключено: ${categoryIds.length}` : 'Все доступны';
  // };

  return (
    <div className="new-delegate-page">
      {contextHolder}

      <div className="form-page-container">
        {/* Заголовок */}
        <Card className="form-header-card" variant="borderless">
          <div className="form-header-icon">
            <TeamOutlined />
          </div>
          <Title level={2} className="form-header-title">
            Назначение нового советника
          </Title>
          <Text className="form-header-subtitle">
            Выберите категорию и назначьте доверенного советника, который будет
            представлять ваши интересы в голосованиях
          </Text>
        </Card>

        {/* Основная форма */}
        <Card className="form-main-card" variant="borderless">
          <Form
            form={form}
            name="new-delegate-settings"
            layout="vertical"
            onFieldsChange={handleFormChange}
          >
            <Form.Item
              name="category"
              label={
                <span>
                  {CategoryLabel}
                  <Tooltip title="Выберите категорию, для которой хотите назначить советника. В голосованиях по этой категории ваш голос будет автоматически передан выбранному советнику.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
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
                label="Выберите категорию..."
              />
            </Form.Item>

            <Form.Item
              name="delegate"
              label={
                <span>
                  {DelegateLabel}
                  <Tooltip title="Выберите пользователя, который станет вашим советником. Его голос будет автоматически учитываться как ваш в голосованиях по выбранной категории.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, выберите советника',
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
                label="Выберите советника..."
              />
            </Form.Item>
          </Form>
        </Card>

        {/* СТАРЫЙ КОД С КНОПКАМИ - ЗАКОММЕНТИРОВАН
        <Card className="form-toolbar-card" variant="borderless">
          <div className="toolbar-content">
            <div className="toolbar-info">
              * Обязательные поля для заполнения
            </div>
            <div className="toolbar-actions">
              <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={onCancel}
                className="toolbar-button"
              >
                Отмена
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={buttonLoading}
                onClick={onFinish}
                disabled={disabled}
                className="toolbar-button"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </Card>
        */}
      </div>

      {/* НОВЫЙ TOOLBAR С ЦЕНТРИРОВАННЫМИ КНОПКАМИ */}
      <div className="toolbar">
        <div className="toolbar-info-left">
          <div className="toolbar-info">
            <TeamOutlined className="info-icon" />
            <span className="info-text">
              Прогресс: <span className="info-highlight">{formProgress}%</span>
            </span>
          </div>
          <div
            className={`toolbar-status ${disabled ? 'status-warning' : 'status-success'}`}
          >
            <span className="status-icon">●</span>
            <span>{getFormStatus()}</span>
          </div>
        </div>

        <div className="toolbar-actions">
          <Button
            type="default"
            htmlType="button"
            onClick={onCancel}
            className="toolbar-button toolbar-button-secondary"
            icon={<ArrowLeftOutlined />}
          >
            Отмена
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={buttonLoading}
            onClick={onFinish}
            disabled={disabled}
            className="toolbar-button toolbar-button-primary"
            icon={<SaveOutlined />}
          >
            Назначить советника
          </Button>
        </div>

        <div className="toolbar-info-right">
          {/*<div className="toolbar-info">*/}
          {/*  <ClockCircleOutlined className="info-icon" />*/}
          {/*  <span className="info-text">*/}
          {/*    Операция: <span className="info-highlight">Назначение</span>*/}
          {/*  </span>*/}
          {/*</div>*/}
          {/*<div className="toolbar-meta">*/}
          {/*  Категория: {getSelectedCategory()}*/}
          {/*</div>*/}
          {/*<div className="toolbar-meta">*/}
          {/*  Советник: {getSelectedDelegate()}*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
}
