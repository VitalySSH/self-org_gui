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
} from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { CrudDataSourceService, UserSettingsAoService } from 'src/services';
import {
  CategoryModel,
  CommunityDescriptionModel,
  CommunityNameModel,
  UserCommunitySettingsModel,
} from 'src/models';
import {
  AuthContextProvider,
  CommunitySettingsInterface,
  Pagination,
} from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { useNavigate } from 'react-router-dom';
import { CommunitySelect, CustomSelect } from 'src/components';
import {
  CategoriesLabel,
  CommunityDescriptionLabel,
  CommunityNameLabel,
  IsCanOfferLabel,
  IsDefaultAddMemberLabel,
  IsMinorityNotParticipateLabel,
  IsNotDelegateLabel,
  IsSecretBallotLabel,
  QuorumLabel,
  SignificantMinorityLabel,
  SystemCategoryCode,
  VoteLabel,
} from 'src/consts';
import { Filters } from 'src/shared/types.ts';

export function MyCommunitySettings(props: any) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const authData: AuthContextProvider = useAuth();
  const [settings, setSettings] = useState({} as UserCommunitySettingsModel);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const communityId = props?.communityId;
  const nameService = new CrudDataSourceService(CommunityNameModel);
  const descriptionService = new CrudDataSourceService(
    CommunityDescriptionModel
  );
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
            'name',
            'description',
            'categories.status',
            'sub_communities_settings.name',
            'sub_communities_settings.description',
          ]
        )
        .then((resp) => {
          if (resp.total) {
            const settingsInst = resp.data[0];
            setSettings(settingsInst);
            form.setFieldValue('categories', settingsInst?.categories);
            form.setFieldValue('name', settingsInst.name);
            form.setFieldValue('description', settingsInst.description);
            form.setFieldValue('quorum', settingsInst.quorum);
            form.setFieldValue('vote', settingsInst.vote);
            form.setFieldValue(
              'significant_minority',
              settingsInst.significant_minority
            );
            form.setFieldValue(
              'is_secret_ballot',
              settingsInst.is_secret_ballot || false
            );
            form.setFieldValue(
              'is_can_offer',
              settingsInst.is_can_offer || false
            );
            form.setFieldValue(
              'is_minority_not_participate',
              settingsInst.is_minority_not_participate || false
            );
            form.setFieldValue(
              'is_default_add_member',
              settingsInst.is_default_add_member || false
            );
            form.setFieldValue(
              'is_not_delegate',
              settingsInst.is_not_delegate || false
            );
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
      Boolean(formData.name) &&
      Boolean(formData.description) &&
      Boolean(formData.quorum) &&
      Boolean(formData.significant_minority) &&
      Boolean(formData.vote);
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
                  name="name"
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
                    value={settings?.name}
                    formField="name"
                    bindLabel="name"
                    enableSearch={true}
                    addOwnValue={true}
                    ownValuePlaceholder="Введите своё наименование"
                    ownValueMaxLength={80}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                <Form.Item
                  name="description"
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
                    value={settings?.description}
                    formField="description"
                    bindLabel="value"
                    enableSearch={true}
                    addOwnValue={true}
                    ownFieldTextarea={true}
                    ownValuePlaceholder="Введите своё описание"
                    ownValueMaxLength={200}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
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
                      width: '20%',
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
                      width: '20%',
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
                      width: '20%',
                    }}
                  />
                </Form.Item>
              </Col>
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
            </Row>
            <Row gutter={16}>
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
                    ownValuePlaceholder="Введите свою категорию"
                    ownValueMaxLength={80}
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
