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
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
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
  QuorumLabel,
  ResponsibilitiesLabel,
  SignificantMinorityLabel,
  SystemCategoryCode,
  VoteLabel,
} from 'src/consts';
import { Filters } from 'src/shared/types.ts';
import './my-community-settings.page.scss';

export function MyCommunitySettings(props: any) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const authData: AuthContextProvider = useAuth();
  const [settings, setSettings] = useState({} as UserCommunitySettingsModel);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const communityId = props?.communityId;
  const nameService = new CrudDataSourceService(CommunityNameModel);
  const descriptionService = new CrudDataSourceService(
    CommunityDescriptionModel
  );
  const categoryService = new CrudDataSourceService(CategoryModel);
  const responsibilityService = new CrudDataSourceService(ResponsibilityModel);

  const [form] = Form.useForm();

  const successInfo = (content: string) => {
    messageApi
      .open({
        type: 'success',
        content: content,
      })
      .then();
  };

  const errorInfo = useCallback(
    (content: string) => {
      messageApi
        .open({
          type: 'error',
          content: content,
        })
        .then();
    },
    [messageApi]
  );

  const getUserCommunitySettings = useCallback(() => {
    if (authData.user && communityId && !settings.id) {
      const settingsService = new CrudDataSourceService(
        UserCommunitySettingsModel
      );
      settingsService
        .list(
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
          ]
        )
        .then((resp) => {
          if (resp.total) {
            const settingsInst = resp.data[0];
            setSettings(settingsInst);
            form.setFieldsValue({
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
              is_secret_ballot: settingsInst?.is_secret_ballot || false,
              is_can_offer: settingsInst?.is_can_offer || false,
              is_minority_not_participate:
                settingsInst?.is_minority_not_participate || false,
              is_default_add_member:
                settingsInst?.is_default_add_member || false,
              is_not_delegate: settingsInst?.is_not_delegate || false,
            });
          } else {
            navigate('/no-much-page');
          }
        })
        .catch((error) => {
          errorInfo(`Ошибка получения настроек: ${error}`);
        });
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

  const onCustomSelectChange = (fieldName: string, value: any) => {
    form.setFieldValue(fieldName, value);
  };

  const onCommunitySelectChange = (value: any) => {
    form.setFieldValue('sub_communities_settings', value);
  };

  const handleFormChange = () => {
    const formData = form.getFieldsValue();
    const isValid =
      Boolean(formData.names) &&
      Boolean(formData.descriptions) &&
      Boolean(formData.quorum) &&
      Boolean(formData.vote) &&
      Boolean(formData.significant_minority) &&
      Boolean(formData.decision_delay) &&
      Boolean(formData.dispute_time_limit);
    setDisabled(!isValid);
  };

  const onFinish = () => {
    setButtonLoading(true);
    const formData: CommunitySettingsInterface = form.getFieldsValue();
    const userSettingsAoService = new UserSettingsAoService();
    userSettingsAoService
      .saveSettingsOnForm(
        settings,
        formData,
        communityId,
        authData.getUserRelation()
      )
      .then(() => {
        successInfo('Настройки сохранены');
        setButtonLoading(false);
      })
      .catch((error) => {
        errorInfo(`Ошибка сохранения настроек: ${error}`);
        setButtonLoading(false);
      });
  };

  return (
    <>
      <div className="community-work-space-with-toolbar">
        {contextHolder}
        <div className="section-header">Мои настройки сообщества</div>
        <Spin
          tip="Загрузка данных"
          size="large"
          spinning={Boolean(!settings.id)}
        >
          <Form
            name="my-community-settings"
            form={form}
            onFieldsChange={handleFormChange}
            preserve={true}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                <Form.Item
                  name="names"
                  label={
                    <span>
                      {CommunityNameLabel}&nbsp;
                      <Tooltip title="Выберите из доступных вариантов понравившееся название для сообщества или предложите своё.">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  labelCol={{ span: 24 }}
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
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
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
                  labelCol={{ span: 24 }}
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
            <Row gutter={[16, 16]} className="voting-core-settings">
              <Col span={24}>
                <div className="voting-core-settings-header">
                  <h3>Основные параметры голосования</h3>
                  <Button
                    type="text"
                    icon={<InfoCircleOutlined style={{ fontSize: 18 }} />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Рекомендации
                  </Button>
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
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
                  labelCol={{ span: 24 }}
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
                    style={{
                      width: 50,
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item
                  name="vote"
                  label={
                    <span>
                      {VoteLabel}&nbsp;
                      <Tooltip title="Введите минимальный процент от всех голосов, который должен получить вариант, требующийся для победы в голосовании. Значение от 50 до 100%.">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  labelCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message:
                        'Пожалуйста, укажите процент голосов для принятия решения, значение от 50 до 100%.',
                    },
                  ]}
                >
                  <InputNumber
                    type="number"
                    controls={false}
                    max={100}
                    min={50}
                    step={1}
                    style={{
                      width: 50,
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
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
                  labelCol={{ span: 24 }}
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
                    style={{
                      width: 50,
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item
                  name="decision_delay"
                  label={
                    <span>
                      {DecisionDelayLabel}&nbsp;
                      <Tooltip title="Укажите количество дней между достижением кворума и моментом вступления решения в силу. Данный период предоставляет участникам возможность для узучения мнений друг друга, анализа последствий и корректировки своей позиции перед принятием решения. Максимальное значение 30 дней.">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  labelCol={{ span: 24 }}
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
                    style={{
                      width: 50,
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item
                  name="dispute_time_limit"
                  label={
                    <span>
                      {DisputeTimeLimitLabel}&nbsp;
                      <Tooltip title="Укажите максимальное количество дней, которое потребуется для урегилирования спорных ситуаций. Максимальное значение 30 дней.">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  labelCol={{ span: 24 }}
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
                    style={{
                      width: 50,
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item
                  name="is_secret_ballot"
                  label={IsSecretBallotLabel}
                  labelCol={{ span: 24 }}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="is_can_offer"
                  label={IsCanOfferLabel}
                  labelCol={{ span: 24 }}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
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
                  labelCol={{ span: 24 }}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item
                  name="is_default_add_member"
                  label={IsDefaultAddMemberLabel}
                  labelCol={{ span: 24 }}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                <Form.Item
                  name="is_not_delegate"
                  label={IsNotDelegateLabel}
                  labelCol={{ span: 24 }}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
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
                  labelCol={{ span: 24 }}
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
                    ownValuePlaceholder="Если не нашли подходящюю, введите свою категорию"
                    ownValueMaxLength={80}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
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
                  labelCol={{ span: 24 }}
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
                    ownValuePlaceholder="Если не нашли подходящюю, введите свою зону ответственности"
                    ownValueMaxLength={200}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                <Form.Item
                  name="sub_communities_settings"
                  label={
                    <span>
                      Внутренние сообщетсва&nbsp;
                      <Tooltip title="Внутренние сообщества отображают границы структурных подразделений основного сообщества.">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  labelCol={{ span: 24 }}
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
          </Form>
        </Spin>
      </div>

      <RecommendationVotingModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      />

      <div className="toolbar">
        <Button
          type="primary"
          htmlType="submit"
          loading={buttonLoading}
          onClick={onFinish}
          disabled={disabled}
          className="toolbar-button"
        >
          Сохранить
        </Button>
      </div>
    </>
  );
}
