import {
  Button,
  Col,
  Form,
  InputNumber,
  message,
  Row,
  Spin,
  Switch,
  Tooltip,
  Card,
  Typography,
  Space,
  Alert,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  TagOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useState, useRef } from 'react';
import { CrudDataSourceService, UserSettingsAoService } from 'src/services';
import {
  CategoryModel,
  CommunityDescriptionModel,
  CommunityNameModel,
  ResponsibilityModel,
  UserCommunitySettingsModel,
} from 'src/models';
import {
  AuthContextProvider,
  CommunitySettingsInterface,
  Pagination,
} from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { useNavigate } from 'react-router-dom';
import {
  CommunitySelect,
  CustomSelect,
  RecommendationVotingModal,
} from 'src/components';
import {
  CategoriesLabel,
  CommunityDescriptionLabel,
  CommunityNameLabel,
  DecisionDelayLabel,
  DisputeTimeLimitLabel,
  IsCanOfferLabel,
  IsDefaultAddMemberLabel,
  IsMinorityNotParticipateLabel,
  IsNotDelegateLabel,
  IsSecretBallotLabel,
  IsWorkGroupLabel,
  QuorumLabel,
  ResponsibilitiesLabel,
  SignificantMinorityLabel,
  SystemCategoryCode,
  VoteLabel,
  WorkGroupLabel,
} from 'src/consts';
import { Filters } from 'src/shared/types.ts';
import './my-community-settings.page.scss';

const { Title, Text } = Typography;

interface MyCommunitySettingsProps {
  communityId: string;
  onSettingsSaved?: () => void;
}

export function MyCommunitySettings(props: MyCommunitySettingsProps) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const authData: AuthContextProvider = useAuth();
  const [settings, setSettings] = useState({} as UserCommunitySettingsModel);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkGroup, setIsWorkGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [switchStates, setSwitchStates] = useState({
    is_secret_ballot: false,
    is_can_offer: false,
    is_minority_not_participate: false,
    is_default_add_member: false,
    is_not_delegate: false,
  });

  const isUpdatingRef = useRef(false);
  const { communityId, onSettingsSaved } = props;

  const nameService = new CrudDataSourceService(CommunityNameModel);
  const descriptionService = new CrudDataSourceService(
    CommunityDescriptionModel
  );
  const categoryService = new CrudDataSourceService(CategoryModel);
  const responsibilityService = new CrudDataSourceService(ResponsibilityModel);

  const [form] = Form.useForm();
  const requiredFields = [
    'names',
    'descriptions',
    'quorum',
    'vote',
    'significant_minority',
    'decision_delay',
    'dispute_time_limit',
  ];

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

  const getUserCommunitySettings = useCallback(async () => {
    if (!authData.user || !communityId || settings.id) return;

    try {
      const settingsService = new CrudDataSourceService(
        UserCommunitySettingsModel
      );
      const resp = await settingsService.list(
        [
          {
            field: 'community_id',
            op: 'equals',
            val: communityId,
          },
          {
            field: 'user_id',
            op: 'equals',
            val: authData.user.id,
          },
        ],
        undefined,
        undefined,
        [
          'user',
          'names',
          'descriptions',
          'responsibilities',
          'categories.status',
          'sub_communities_settings.names',
          'sub_communities_settings.descriptions',
          'sub_communities_settings.community.main_settings.name',
          'sub_communities_settings.community.main_settings.description',
        ]
      );

      if (resp.total) {
        const settingsInst = resp.data[0];
        setSettings(settingsInst);

        const formValues = {
          categories: settingsInst?.categories,
          names: settingsInst.names,
          descriptions: settingsInst.descriptions,
          responsibilities: settingsInst?.responsibilities,
          sub_communities_settings: settingsInst.sub_communities_settings,
          quorum: settingsInst?.quorum,
          vote: settingsInst?.vote,
          significant_minority: settingsInst?.significant_minority,
          decision_delay: settingsInst?.decision_delay,
          dispute_time_limit: settingsInst?.dispute_time_limit,
          is_workgroup: settingsInst?.is_workgroup,
          workgroup: settingsInst?.workgroup,
          is_secret_ballot: Boolean(settingsInst?.is_secret_ballot),
          is_can_offer: Boolean(settingsInst?.is_can_offer),
          is_minority_not_participate: Boolean(
            settingsInst?.is_minority_not_participate
          ),
          is_default_add_member: Boolean(settingsInst?.is_default_add_member),
          is_not_delegate: Boolean(settingsInst?.is_not_delegate),
        };

        setSwitchStates({
          is_secret_ballot: Boolean(settingsInst?.is_secret_ballot),
          is_can_offer: Boolean(settingsInst?.is_can_offer),
          is_minority_not_participate: Boolean(
            settingsInst?.is_minority_not_participate
          ),
          is_default_add_member: Boolean(settingsInst?.is_default_add_member),
          is_not_delegate: Boolean(settingsInst?.is_not_delegate),
        });

        form.setFieldsValue(formValues);
        setIsWorkGroup(Boolean(settingsInst?.is_workgroup));

        // Принудительно обновляем состояние после установки значений формы
        setTimeout(() => {
          const currentFormData = form.getFieldsValue();
          setIsWorkGroup(Boolean(currentFormData.is_workgroup));
        }, 0);
      } else {
        navigate('/no-much-page');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      errorInfo(`Ошибка получения настроек: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [authData.user, communityId, errorInfo, form, navigate, settings.id]);

  const getCommunityNames = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'community_id',
      op: 'equals',
      val: communityId,
    });
    return await nameService.list(newFilters, undefined, pagination);
  };

  const getCommunityDescriptions = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'community_id',
      op: 'equals',
      val: communityId,
    });
    return await descriptionService.list(newFilters, undefined, pagination);
  };

  const getResponsibilities = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'community_id',
      op: 'equals',
      val: communityId,
    });
    return await responsibilityService.list(newFilters, undefined, pagination);
  };

  const getCategories = async (pagination?: Pagination, filters?: Filters) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'community_id',
      op: 'equals',
      val: communityId,
    });
    newFilters.push({
      field: 'status.code',
      op: 'ne',
      val: SystemCategoryCode,
    });
    return categoryService.list(newFilters, undefined, pagination);
  };

  useEffect(() => {
    getUserCommunitySettings();
  }, [getUserCommunitySettings]);

  const onCustomSelectChange = useCallback(
    (fieldName: string, value: any) => {
      // Проверяем, не находимся ли мы уже в процессе обновления
      if (isUpdatingRef.current) return;

      // Используем requestIdleCallback для разрыва цикла или setTimeout как fallback
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true;
            form.setFieldValue(fieldName, value);
            if (value === null && requiredFields.includes(fieldName)) {
              setDisabled(true);
            }
            // Сброс флага через короткий таймаут
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 10);
          }
        });
      } else {
        setTimeout(() => {
          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true;
            form.setFieldValue(fieldName, value);
            // Сброс флага через короткий таймаут
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 10);
          }
        }, 0);
      }
    },
    [form]
  );

  const handleFormChange = useCallback(() => {
    const formData = form.getFieldsValue();
    const newIsWorkGroup = Boolean(formData.is_workgroup);

    if (isWorkGroup !== newIsWorkGroup) {
      setIsWorkGroup(newIsWorkGroup);
    }

    const isValid =
      Boolean(formData.names) &&
      Boolean(formData.descriptions) &&
      Boolean(formData.quorum) &&
      Boolean(formData.vote) &&
      Boolean(formData.significant_minority) &&
      Boolean(formData.decision_delay) &&
      Boolean(formData.dispute_time_limit) &&
      (!formData.is_workgroup || (formData.is_workgroup && formData.workgroup));

    setDisabled(!isValid);
  }, [form, isWorkGroup]);

  const handleWorkGroupChange = useCallback(
    (checked: boolean) => {
      setIsWorkGroup(checked);

      // Проверяем, не находимся ли мы уже в процессе обновления
      if (isUpdatingRef.current) return;

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true;
            form.setFieldValue('is_workgroup', checked);
            // Сброс флага через короткий таймаут
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 10);
          }
        });
      } else {
        setTimeout(() => {
          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true;
            form.setFieldValue('is_workgroup', checked);
            // Сброс флага через короткий таймаут
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 10);
          }
        }, 0);
      }
    },
    [form]
  );

  const handleSwitchChange = useCallback(
    (fieldName: string, checked: boolean) => {
      setSwitchStates((prev) => ({ ...prev, [fieldName]: checked }));
      form.setFieldValue(fieldName, checked);
    },
    [form]
  );

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        handleFormChange();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, handleFormChange]);

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      const formData: CommunitySettingsInterface = form.getFieldsValue();
      const userSettingsAoService = new UserSettingsAoService();

      await userSettingsAoService.saveSettingsOnForm(
        settings,
        formData,
        communityId,
        authData.getUserRelation()
      );

      successInfo('Настройки сохранены');

      // Вызываем callback для обновления данных в родительском компоненте
      if (onSettingsSaved) {
        setTimeout(() => onSettingsSaved(), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      errorInfo(`Ошибка сохранения настроек: ${error}`);
    } finally {
      setButtonLoading(false);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  // Компонент поля рабочей группы
  const WorkgroupField = () => (
    <Form.Item
      name="workgroup"
      label={
        <span>
          {WorkGroupLabel}&nbsp;
          <Tooltip title="Предложите оптимальное, с вашей точки зрения количество участников для формирования рабочих групп. Минимум 3, максимум 15 человек.">
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
      }
      rules={[
        {
          required: true,
          message: 'Пожалуйста, укажите количество участников рабочей группы',
        },
      ]}
    >
      <InputNumber
        type="number"
        controls={false}
        max={15}
        min={3}
        step={1}
        precision={0}
        style={{ width: '100%', maxWidth: 120 }}
        addonAfter="чел."
      />
    </Form.Item>
  );

  // Основная информация
  const renderBasicInfo = () => (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>Основная информация</span>
        </Space>
      }
      className="settings-section"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24}>
          <Form.Item
            name="names"
            label={
              <span>
                {CommunityNameLabel}&nbsp;
                <Tooltip title="Выберите из доступных вариантов понравившееся название для сообщества или предложите свое.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Пожалуйста, выберите наименование сообщества',
              },
            ]}
          >
            <CustomSelect
              fieldService={nameService}
              requestOptions={getCommunityNames}
              onChange={onCustomSelectChange}
              value={settings?.names}
              formField="names"
              bindLabel="name"
              multiple={true}
              enableSearch={true}
              addOwnValue={true}
              ownValuePlaceholder="Если не нашли подходящее, введите своё наименование"
              ownValueMaxLength={80}
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="descriptions"
            label={
              <span>
                {CommunityDescriptionLabel}&nbsp;
                <Tooltip title="Выберите из доступных вариантов наилучшее описание сообщества или предложите своё.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Пожалуйста, выберите описание сообщества',
              },
            ]}
          >
            <CustomSelect
              fieldService={descriptionService}
              requestOptions={getCommunityDescriptions}
              onChange={onCustomSelectChange}
              value={settings?.descriptions}
              formField="descriptions"
              bindLabel="value"
              multiple={true}
              enableSearch={true}
              addOwnValue={true}
              ownFieldTextarea={true}
              ownValuePlaceholder="Если не нашли подходящее, введите своё описание"
              ownValueMaxLength={200}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Настройки голосования
  const renderVotingSettings = () => (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>Основные параметры голосования</span>
        </Space>
      }
      className="settings-section voting-settings-card"
      extra={
        <Button
          type="text"
          icon={<InfoCircleOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="recommendations-button"
        >
          Рекомендации
        </Button>
      }
    >
      <Alert
        message="Важные параметры"
        description="Эти настройки определяют основные правила принятия решений в вашем сообществе"
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="quorum"
            label={
              <span>
                {QuorumLabel}&nbsp;
                <Tooltip title="Введите минимальный процент от числа участников сообщества, требующийся для правомочности голосования. Значение от 1 до 100%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите кворум сообщества, значение от 1 до 100%.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={100}
              min={1}
              step={1}
              precision={0}
              style={{ width: '100%', maxWidth: 120 }}
              addonAfter="%"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="vote"
            label={
              <span>
                {VoteLabel}&nbsp;
                <Tooltip title="Введите минимальный процент от всех голосов, который должен получить вариант, требующийся для победы в голосовании. Значение от 51 до 100%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите процент голосов для принятия решения, значение от 51 до 100%.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={100}
              min={51}
              step={1}
              precision={0}
              style={{ width: '100%', maxWidth: 120 }}
              addonAfter="%"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="significant_minority"
            label={
              <span>
                {SignificantMinorityLabel}&nbsp;
                <Tooltip title="Введите минимальный процент от всех голосов, при достижении которого вариант голосования будет считаться общественно-значимым. Значение от 1 до 50%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите процент общественно-значимого меньшинства, значение от 1 до 49%.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={49}
              min={1}
              step={1}
              precision={0}
              style={{ width: '100%', maxWidth: 120 }}
              addonAfter="%"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Временные настройки
  const renderTimeSettings = () => (
    <Card
      title={
        <Space>
          <InfoCircleOutlined />
          <span>Временные параметры</span>
        </Space>
      }
      className="settings-section"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="decision_delay"
            label={
              <span>
                {DecisionDelayLabel}&nbsp;
                <Tooltip title="Укажите количество дней между достижением кворума и моментом вступления решения в силу. Данный период предоставляет участникам возможность для изучения мнений друг друга, анализа последствий и корректировки своей позиции перед принятием решения. Максимальное значение 30 дней.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите количество дней отсрочки вступления решения в силу, значение от 1 до 30 дней.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={30}
              min={1}
              step={1}
              precision={0}
              style={{ width: '100%', maxWidth: 120 }}
              addonAfter="дн."
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="dispute_time_limit"
            label={
              <span>
                {DisputeTimeLimitLabel}&nbsp;
                <Tooltip title="Укажите максимальное количество дней, которое потребуется для урегулирования спорных ситуаций. Максимальное значение 30 дней.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите количество дней для рассмотрения споров, значение от 1 до 30 дней.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={30}
              min={1}
              step={1}
              precision={0}
              style={{ width: '100%', maxWidth: 120 }}
              addonAfter="дн."
            />
          </Form.Item>
        </Col>
        {isWorkGroup && (
          <Col xs={24} sm={12} lg={8}>
            <WorkgroupField />
          </Col>
        )}
      </Row>
    </Card>
  );

  // Дополнительные настройки
  const renderAdditionalSettings = () => (
    <Card
      title={
        <Space>
          <CheckOutlined />
          <span>Дополнительные настройки</span>
        </Space>
      }
      className="settings-section"
    >
      <Row gutter={[24, 20]}>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="is_workgroup"
            label={
              <span>
                {IsWorkGroupLabel}&nbsp;
                <Tooltip title="Рабочая группа может быть сформирована после утверждения инициативы, для выработки одного или нескольких проектов реализации данной инициативы. При отсутствии рабочей группы предполагается, что в выработке проектов реализаций участвуют все желающие участники сообщества.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            valuePropName="checked"
          >
            <div className="switch-container">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={isWorkGroup}
                onChange={handleWorkGroupChange}
              />
              <Text type="secondary" className="switch-description">
                {isWorkGroup
                  ? 'Требуются рабочие группы'
                  : 'Рабочие группы не требуются'}
              </Text>
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="is_secret_ballot"
            label={IsSecretBallotLabel}
            valuePropName="checked"
          >
            <div className="switch-container">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={switchStates.is_secret_ballot}
                onChange={(checked) =>
                  handleSwitchChange('is_secret_ballot', checked)
                }
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="is_can_offer"
            label={IsCanOfferLabel}
            valuePropName="checked"
          >
            <div className="switch-container">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={switchStates.is_can_offer}
                onChange={(checked) =>
                  handleSwitchChange('is_can_offer', checked)
                }
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="is_minority_not_participate"
            label={
              <span>
                {IsMinorityNotParticipateLabel}&nbsp;
                <Tooltip title="В случае утверждения инициативы, меньшинство, которое её не поддержало обязано принимать участие в её исполнении или достаточно того, что оно не должно препятствовать?">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            valuePropName="checked"
          >
            <div className="switch-container">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={switchStates.is_minority_not_participate}
                onChange={(checked) =>
                  handleSwitchChange('is_minority_not_participate', checked)
                }
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="is_default_add_member"
            label={IsDefaultAddMemberLabel}
            valuePropName="checked"
          >
            <div className="switch-container">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={switchStates.is_default_add_member}
                onChange={(checked) =>
                  handleSwitchChange('is_default_add_member', checked)
                }
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item
            name="is_not_delegate"
            label={IsNotDelegateLabel}
            valuePropName="checked"
          >
            <div className="switch-container">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={switchStates.is_not_delegate}
                onChange={(checked) =>
                  handleSwitchChange('is_not_delegate', checked)
                }
              />
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Категории и обязанности
  const renderCategoriesAndResponsibilities = () => (
    <Card
      title={
        <Space>
          <TagOutlined />
          <span>Категории и зоны ответственности</span>
        </Space>
      }
      className="settings-section"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24}>
          <Form.Item
            name="categories"
            label={
              <span>
                {CategoriesLabel}&nbsp;
                <Tooltip title="Категории - это темы или направления для голосований. Они помогают структурировать вопросы и выбирать советников.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <CustomSelect
              fieldService={categoryService}
              requestOptions={getCategories}
              onChange={onCustomSelectChange}
              value={settings?.categories}
              formField="categories"
              bindLabel="name"
              multiple={true}
              enableSearch={true}
              addOwnValue={true}
              ownValuePlaceholder="Если не нашли подходящую, введите свою категорию"
              ownValueMaxLength={80}
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="responsibilities"
            label={
              <span>
                {ResponsibilitiesLabel}&nbsp;
                <Tooltip title="Зона ответственности - это закрепленная за сообществом сфера полномочий, которая определяет типы вопросов для утверждения. Устанавливает границы влияния, запрещая принятие решений по этим вопросам во внутренних сообществах.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <CustomSelect
              fieldService={responsibilityService}
              requestOptions={getResponsibilities}
              onChange={onCustomSelectChange}
              value={settings?.responsibilities}
              formField="responsibilities"
              bindLabel="name"
              multiple={true}
              enableSearch={true}
              addOwnValue={true}
              ownFieldTextarea={true}
              ownValuePlaceholder="Если не нашли подходящую, введите свою зону ответственности"
              ownValueMaxLength={200}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const onCommunitySelectChange = useCallback(
    (value: any) => {
      // Проверяем, не находимся ли мы уже в процессе обновления
      if (isUpdatingRef.current) return;

      // Проверяем, изменилось ли значение
      const currentValue = form.getFieldValue('sub_communities_settings');

      // Простое сравнение по количеству элементов и их id
      const isEqual =
        currentValue?.length === value?.length &&
        currentValue?.every(
          (item: any, index: number) => item?.id === value[index]?.id
        );

      if (isEqual) return;

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true;
            form.setFieldValue('sub_communities_settings', value);
            // Сброс флага через короткий таймаут
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 10);
          }
        });
      } else {
        setTimeout(() => {
          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true;
            form.setFieldValue('sub_communities_settings', value);
            // Сброс флага через короткий таймаут
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 10);
          }
        }, 0);
      }
    },
    [form]
  );

  // Внутренние сообщества
  const renderSubCommunities = () => (
    <Card
      title={
        <Space>
          <TeamOutlined />
          <span>Структура сообщества</span>
        </Space>
      }
      className="settings-section"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24}>
          <Form.Item
            name="sub_communities_settings"
            label={
              <span>
                Внутренние сообщества&nbsp;
                <Tooltip title="Внутренние сообщества отображают границы структурных подразделений основного сообщества.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <CommunitySelect
              parentCommunityId={communityId}
              parentSettings={settings}
              onChange={onCommunitySelectChange}
              values={settings?.sub_communities_settings}
              readonly={false}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Получаем количество заполненных обязательных полей для отображения прогресса
  // const getFormProgress = () => {
  //   const formData = form.getFieldsValue();
  //   const filledFields = requiredFields.filter(field => {
  //     const value = formData[field];
  //     return value && (Array.isArray(value) ? value.length > 0 : true);
  //   });
  //   return Math.round((filledFields.length / requiredFields.length) * 100);
  // };

  const getFormStatus = () => {
    if (disabled) return 'Требуется заполнение';
    return 'Готово к сохранению';
  };

  // const getCommunityName = () => {
  //   if (settings?.names && settings.names.length > 0) {
  //     return settings.names[0].name || 'Сообщество';
  //   }
  //   return 'Сообщество';
  // };

  if (isLoading) {
    return (
      <div className="my-community-settings-loading">
        <Spin size="large" />
        <Text type="secondary" style={{ marginTop: 16 }}>
          Загрузка настроек сообщества...
        </Text>
      </div>
    );
  }

  return (
    <div className="my-community-settings-container">
      {contextHolder}

      <div className="settings-header">
        <Title level={2} className="settings-title">
          Мои настройки сообщества
        </Title>
        <Text type="secondary" className="settings-subtitle">
          Настройте параметры участия в сообществе под свои предпочтения
        </Text>
      </div>

      <Form
        name="my-community-settings"
        form={form}
        onFieldsChange={handleFormChange}
        preserve={true}
        layout="vertical"
        className="my-community-settings-form"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {renderBasicInfo()}
          {renderVotingSettings()}
          {renderTimeSettings()}
          {renderAdditionalSettings()}
          {renderCategoriesAndResponsibilities()}
          {renderSubCommunities()}
        </Space>
      </Form>

      <RecommendationVotingModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      />

      {/* Toolbar с кнопками */}
      <div className="toolbar">
        <div className="toolbar-info-left">
          {/*<div className="toolbar-info">*/}
          {/*  <SettingOutlined className="info-icon" />*/}
          {/*  <span className="info-text">*/}
          {/*    Прогресс: <span className="info-highlight">{getFormProgress()}%</span>*/}
          {/*  </span>*/}
          {/*</div>*/}
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
            Назад
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
            Сохранить настройки
          </Button>
        </div>

        <div className="toolbar-info-right">
          {/*<div className="toolbar-info">*/}
          {/*  <ClockCircleOutlined className="info-icon" />*/}
          {/*  <span className="info-text">*/}
          {/*    Статус: <span className="info-highlight">Настройка</span>*/}
          {/*  </span>*/}
          {/*</div>*/}
          {/*<div className="toolbar-meta">*/}
          {/*  {getCommunityName()}*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
}
