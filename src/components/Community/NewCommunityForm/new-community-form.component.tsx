import { NewCommunityFormProps } from 'src/interfaces';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Tooltip,
  Card,
  Typography,
  Alert,
} from 'antd';
import {
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
  SignificantMinorityLabel,
  VoteLabel,
  WorkGroupLabel,
} from 'src/consts';
import {
  CheckOutlined,
  CloseOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  UserOutlined,
  TagOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { useState, useCallback } from 'react';
import './new-community-form.component.scss';

const { Text } = Typography;

export function NewCommunityForm(props: NewCommunityFormProps) {
  const [isWorkGroup, setIsWorkGroup] = useState(false);

  const [switchStates, setSwitchStates] = useState({
    is_secret_ballot: false,
    is_can_offer: false,
    is_minority_not_participate: false,
    is_default_add_member: false,
    is_not_delegate: false,
  });

  const handleFormChange = () => {
    const formData = props.form.getFieldsValue();
    const newIsWorkGroup = Boolean(formData.is_workgroup);

    if (isWorkGroup !== newIsWorkGroup) {
      setIsWorkGroup(newIsWorkGroup);
    }

    const isValid =
      Boolean(formData.name) &&
      Boolean(formData.description) &&
      Boolean(formData.quorum) &&
      Boolean(formData.significant_minority) &&
      Boolean(formData.vote) &&
      Boolean(formData.decision_delay) &&
      Boolean(formData.dispute_time_limit);

    props.setDisabledButton(!isValid);
  };

  const handleWorkGroupChange = (checked: boolean) => {
    setIsWorkGroup(checked);
    props.form.setFieldValue('is_workgroup', checked);
  };

  const handleSwitchChange = useCallback((fieldName: string, checked: boolean) => {
    setSwitchStates(prev => ({ ...prev, [fieldName]: checked }));
    props.form.setFieldValue(fieldName, checked);
  }, [props.form]);

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
      className="form-section"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24}>
          <Form.Item
            name="name"
            label={
              <span>
                {CommunityNameLabel}&nbsp;
                <Tooltip title="Введите название вашего сообщества. Максимум 80 символов.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите наименование сообщества',
              },
              {
                max: 80,
                message: 'Название должно содержать не более 80 символов.',
              },
            ]}
          >
            <Input
              placeholder="Введите название сообщества"
              showCount
              maxLength={80}
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="description"
            label={
              <span>
                {CommunityDescriptionLabel}&nbsp;
                <Tooltip title="Введите описание вашего сообщества. Максимум 200 символов.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Пожалуйста, заполните описание сообщества',
              },
              {
                max: 200,
                message: 'Описание должно содержать не более 200 символов.',
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Опишите цели и задачи вашего сообщества"
              showCount
              maxLength={200}
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
          <span>Параметры голосования</span>
        </Space>
      }
      className="form-section voting-section"
    >
      <Alert
        message="Важные параметры"
        description="Эти настройки определяют правила принятия решений в сообществе"
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
                <Tooltip title="Введите минимальный процент участников для действительности голосования. Значение от 1 до 100%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Пожалуйста, укажите кворум сообщества',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={100}
              min={1}
              step={1}
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
                <Tooltip title="Введите минимальную долю голосов, необходимую для принятия решения. Значение от 50 до 100%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Пожалуйста, укажите избирательный порог.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={100}
              min={50}
              step={1}
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
                <Tooltip title="Введите минимальный процент голосов, при достижении которого вариант считается общественно значимым. Значение от 1 до 50%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Пожалуйста, укажите процент общественно-значимого меньшинства, значение от 1 до 50%.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={50}
              min={1}
              step={1}
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
      className="form-section"
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
                message: 'Пожалуйста, укажите количество дней отсрочки вступления решения в силу, значение от 1 до 30 дней.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={30}
              min={1}
              step={1}
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
                message: 'Пожалуйста, укажите количество дней для рассмотрения споров, значение от 1 до 30 дней.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={30}
              min={1}
              step={1}
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
      className="form-section"
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
                {isWorkGroup ? 'Требуются рабочие группы' : 'Рабочие группы не требуются'}
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
                onChange={(checked) => handleSwitchChange('is_secret_ballot', checked)}
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
                onChange={(checked) => handleSwitchChange('is_can_offer', checked)}
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
                onChange={(checked) => handleSwitchChange('is_minority_not_participate', checked)}
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
                onChange={(checked) => handleSwitchChange('is_default_add_member', checked)}
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
                onChange={(checked) => handleSwitchChange('is_not_delegate', checked)}
              />
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Категории
  const renderCategories = () => (
    <Card
      title={
        <Space>
          <TagOutlined />
          <span>Категории</span>
        </Space>
      }
      className="form-section"
    >
      <Alert
        message="Категории помогают структурировать голосования"
        description="Категории - это темы или направления для голосований. Они помогают структурировать вопросы и выбирать советников."
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.List name="categories">
        {(fields, { add, remove }) => (
          <div className="categories-list">
            <Space direction="vertical" style={{ width: '100%' }}>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="category-item">
                  <Space.Compact style={{ width: '100%' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      style={{ flex: 1, marginBottom: 0 }}
                      rules={[
                        {
                          required: true,
                          message: 'Пожалуйста, укажите наименование категории',
                        },
                        {
                          max: 80,
                          message: 'Максимум 80 символов',
                        },
                      ]}
                    >
                      <Input
                        placeholder="Наименование категории"
                        maxLength={80}
                        showCount
                      />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      className="remove-category-btn"
                    />
                  </Space.Compact>
                </div>
              ))}
            </Space>

            <Form.Item style={{ marginTop: fields.length > 0 ? 16 : 0, marginBottom: 0 }}>
              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Добавить категорию
              </Button>
            </Form.Item>
          </div>
        )}
      </Form.List>
    </Card>
  );

  return (
    <div className="new-community-form">
      <Form
        form={props.form}
        name="new-community-settings"
        onFieldsChange={handleFormChange}
        layout="vertical"
        className="new-community-form-content"
        initialValues={{
          is_workgroup: false,
          is_secret_ballot: false,
          is_can_offer: false,
          is_minority_not_participate: false,
          is_default_add_member: false,
          is_not_delegate: false,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {renderBasicInfo()}
          {renderVotingSettings()}
          {renderTimeSettings()}
          {renderAdditionalSettings()}
          {renderCategories()}
        </Space>
      </Form>
    </div>
  );
}