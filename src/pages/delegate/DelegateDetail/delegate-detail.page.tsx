import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  message,
  Select,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  QuestionCircleOutlined,
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { AuthApiClientService, CrudDataSourceService } from 'src/services';
import { DelegateSettingsModel } from 'src/models';
import { CustomSelect } from 'src/components';
import { Pagination } from 'src/interfaces';
import { CategoryLabel, DelegateLabel } from 'src/consts';
import { Filters } from 'src/shared/types.ts';
import './delegate-detail.page.scss';

const { Title, Text } = Typography;

interface DelegateDetailProps {
  communityId: string;
}

export function DelegateDetail(props: DelegateDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [delegate, setDelegate] = useState<DelegateSettingsModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  const authApiClientService = new AuthApiClientService();
  const [form] = Form.useForm();

  const successInfo = (content: string) => {
    messageApi.open({
      type: 'success',
      content: content,
    });
  };

  const errorInfo = useCallback(
    (content: string) => {
      messageApi.open({
        type: 'error',
        content: content,
      });
    },
    [messageApi]
  );

  const fetchDelegateSettings = useCallback(() => {
    if (!delegate && id) {
      const delegateService = new CrudDataSourceService(DelegateSettingsModel);
      delegateService
        .get(id, ['category', 'delegate'])
        .then((delegateInst) => {
          setDelegate(delegateInst);
          form.setFieldsValue({
            category: delegateInst.category?.name,
            delegate: delegateInst.delegate,
          });
          // Инициализируем прогресс
          setFormProgress(delegateInst.delegate ? 100 : 0);
        })
        .catch((error) => {
          errorInfo(`Не удалось загрузить настройки советника: ${error}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [delegate, id, errorInfo, form]);

  useEffect(() => {
    fetchDelegateSettings();
  }, [fetchDelegateSettings]);

  const onCustomSelectChange = (fieldName: string, value: any) => {
    form.setFieldValue(fieldName, value);
    handleFormChange();
  };

  const handleFormChange = () => {
    const hasDelegate = Boolean(form.getFieldValue('delegate'));
    setDisabled(!hasDelegate);

    // Обновляем прогресс (есть только одно обязательное поле - delegate)
    setFormProgress(hasDelegate ? 100 : 0);
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
      const updatedDelegate = delegate;

      if (!updatedDelegate) {
        errorInfo('Настройки советника не найдены');
        return;
      }

      const delegateService = new CrudDataSourceService(DelegateSettingsModel);
      updatedDelegate.delegate = form.getFieldValue('delegate');

      await delegateService.save(updatedDelegate);
      successInfo('Советник успешно изменён');
      navigate(-1);
    } catch (error) {
      errorInfo(`Ошибка при сохранении: ${error}`);
    } finally {
      setButtonLoading(false);
    }
  };

  const getFormStatus = () => {
    if (disabled) return 'Требуется выбор советника';
    return 'Готово к сохранению';
  };

  // const getCurrentDelegate = () => {
  //   const currentDelegate = form.getFieldValue('delegate');
  //   return currentDelegate?.fullname || 'Не выбран';
  // };
  //
  // const getCategoryName = () => {
  //   return delegate?.category?.name || 'Загрузка...';
  // };

  // Состояние загрузки
  if (loading) {
    return (
      <div className="delegate-detail-page">
        <div className="form-page-container">
          <Card className="form-loading-card" variant="borderless">
            <Spin size="large" />
            <Text className="loading-text">Загрузка настроек советника...</Text>
          </Card>
        </div>
      </div>
    );
  }

  // Если данные не найдены
  if (!delegate) {
    return (
      <div className="delegate-detail-page">
        <div className="form-page-container">
          <Card className="form-loading-card" variant="borderless">
            <Text className="loading-text">Настройки советника не найдены</Text>
            <Button type="primary" onClick={onCancel} style={{ marginTop: 16 }}>
              Вернуться назад
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="delegate-detail-page">
      {contextHolder}

      <div className="form-page-container">
        {/* Заголовок */}
        <Card className="form-header-card" variant="borderless">
          <div className="form-header-icon">
            <EditOutlined />
          </div>
          <Title level={2} className="form-header-title">
            Замена советника
          </Title>
          <Text className="form-header-subtitle">
            Измените назначенного советника для выбранной категории. Новый
            советник будет представлять ваши интересы в дальнейших голосованиях
          </Text>
        </Card>

        {/* Основная форма */}
        <Card className="form-main-card" variant="borderless">
          <Form
            form={form}
            name="delegate-settings-detail"
            layout="vertical"
            onFieldsChange={handleFormChange}
          >
            <Form.Item
              name="category"
              label={
                <span>
                  {CategoryLabel}
                  <Tooltip title="Категория, для которой назначен советник. Изменить категорию нельзя.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
            >
              <Select
                suffixIcon={null}
                open={false}
                removeIcon={null}
                disabled
                placeholder="Категория загружается..."
              />
            </Form.Item>

            <Form.Item
              name="delegate"
              label={
                <span>
                  {DelegateLabel}
                  <Tooltip title="Выберите нового советника, который будет представлять ваши интересы в голосованиях по указанной категории.">
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
                value={delegate?.delegate}
                formField="delegate"
                bindLabel="fullname"
                enableSearch={true}
                label="Выберите нового советника..."
              />
            </Form.Item>
          </Form>
        </Card>

        {/* Информационная карточка */}
        <Card className="form-info-card" variant="borderless">
          <div className="info-content">
            <div className="info-icon">
              <QuestionCircleOutlined />
            </div>
            <div className="info-text">
              <Title level={5} className="info-title">
                Важная информация
              </Title>
              <Text className="info-description">
                При смене советника все будущие голосования по данной категории
                будут автоматически учитывать голос нового советника вместо
                предыдущего. Уже завершенные голосования не изменятся.
              </Text>
            </div>
          </div>
        </Card>

        {/* СТАРЫЙ КОД С КНОПКАМИ - ЗАКОММЕНТИРОВАН
        <Card className="form-toolbar-card" variant="borderless">
          <div className="toolbar-content">
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
                Сохранить изменения
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
            Сохранить изменения
          </Button>
        </div>

        <div className="toolbar-info-right">
          {/*  <div className="toolbar-info">*/}
          {/*    <ClockCircleOutlined className="info-icon" />*/}
          {/*    <span className="info-text">*/}
          {/*      Операция: <span className="info-highlight">Замена</span>*/}
          {/*    </span>*/}
          {/*  </div>*/}
          {/*  <div className="toolbar-meta">*/}
          {/*    Категория: {getCategoryName()}*/}
          {/*  </div>*/}
          {/*  <div className="toolbar-meta">*/}
          {/*    Советник: {getCurrentDelegate()}*/}
          {/*  </div>*/}
        </div>
      </div>
    </div>
  );
}
