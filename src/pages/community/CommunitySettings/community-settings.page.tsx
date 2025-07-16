import { Col, Form, Input, InputNumber, Row, Spin, Switch, Card, Typography, Tag, Space } from 'antd';
import { CheckOutlined, CloseOutlined, InfoCircleOutlined, TeamOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { CrudDataSourceService } from 'src/services';
import { CommunityModel } from 'src/models';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CategoriesLabel,
  DecisionDelayLabel,
  DisputeTimeLimitLabel,
  IsMinorityNotParticipateLabel,
  IsSecretBallotLabel,
  IsWorkGroupLabel,
  QuorumLabel,
  ResponsibilitiesLabel,
  SignificantMinorityLabel,
  VoteLabel,
  WorkGroupLabel,
} from 'src/consts';
import './community-settings.page.scss';

const { Title, Text } = Typography;

export function CommunitySettings(props: any) {
  const navigate = useNavigate();
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isWorkGroup, setIsWorkGroup] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const communityService = new CrudDataSourceService(CommunityModel);

  const communityId = props?.communityId;
  const [form] = Form.useForm();

  const getCommunitySettings = useCallback(async () => {
    if (!communityId) {
      setSettingsLoading(false);
      return;
    }

    try {
      const community = await communityService.get(communityId, [
        'creator',
        'main_settings.name',
        'main_settings.description',
        'main_settings.categories',
        'main_settings.responsibilities',
      ]);
      const s = community.main_settings || {};
      setIsWorkGroup(Boolean(s.is_workgroup));
      const initialValues = {
        name: s.name?.name || '',
        description: s.description?.value || '',
        quorum: s.quorum ?? 0,
        vote: s.vote ?? 0,
        significant_minority: s.significant_minority ?? 0,
        decision_delay: s.decision_delay ?? 0,
        dispute_time_limit: s.dispute_time_limit ?? 0,
        is_workgroup: Boolean(s.is_workgroup),
        workgroup: s.workgroup ?? 0,
        is_secret_ballot: Boolean(s.is_secret_ballot),
        is_can_offer: Boolean(s.is_can_offer),
        is_minority_not_participate: Boolean(s.is_minority_not_participate),
        categories: (s.categories || []).map(c => c.name),
        responsibilities: (s.responsibilities || []).map(r => r.name),
        creator: community.creator?.fullname || 'Не указан',
      };

      setFormData(initialValues);
      form.setFieldsValue(initialValues);
    } catch (error) {
      console.error('Error loading community settings:', error);
      navigate('/no-much-page');
    } finally {
      setSettingsLoading(false);
    }
  }, [communityId, communityService, form, navigate]);

  useEffect(() => {
    getCommunitySettings();
  }, [getCommunitySettings]);

  const renderInfoCard = () => (
    <Card className="community-info-card" size="small">
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div className="info-item">
          <InfoCircleOutlined className="info-icon" />
          <Text type="secondary">Все поля доступны только для просмотра</Text>
        </div>
        <div className="info-item">
          <TeamOutlined className="info-icon" />
          <Text type="secondary">
            Для внесения изменений перейдите в раздел "Мои настройки"
          </Text>
        </div>
      </Space>
    </Card>
  );

  const renderBasicInfo = () => (
    <Card
      title={
        <Space>
          <InfoCircleOutlined />
          <span>Основная информация</span>
        </Space>
      }
      className="settings-section"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} lg={12}>
          <Form.Item name="name" label="Наименование">
            <Input readOnly className="readonly-input" />
          </Form.Item>
        </Col>
        <Col xs={24} lg={12}>
          <Form.Item name="creator" label="Инициатор создания">
            <Input readOnly className="readonly-input" prefix={<UserOutlined />} />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item name="description" label="Описание">
            <TextArea readOnly rows={3} className="readonly-textarea" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderVotingSettings = () => (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>Настройки голосования</span>
        </Space>
      }
      className="settings-section"
    >
      <Row gutter={[24, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Form.Item name="quorum" label={QuorumLabel}>
            <div className="number-display">
              <InputNumber
                readOnly
                className="readonly-number"
                value={formData.quorum}
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace('%', '') || ''}
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Form.Item name="vote" label={VoteLabel}>
            <div className="number-display">
              <InputNumber
                readOnly
                className="readonly-number"
                value={formData.vote}
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace('%', '') || ''}
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Form.Item name="significant_minority" label={SignificantMinorityLabel}>
            <div className="number-display">
              <InputNumber
                readOnly
                className="readonly-number"
                value={formData.significant_minority}
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace('%', '') || ''}
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Form.Item name="decision_delay" label={DecisionDelayLabel}>
            <div className="number-display">
              <InputNumber
                readOnly
                className="readonly-number"
                value={formData.decision_delay}
                formatter={(value) => `${value} дн.`}
                parser={(value) => value?.replace(' дн.', '') || ''}
              />
            </div>
          </Form.Item>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Form.Item name="dispute_time_limit" label={DisputeTimeLimitLabel}>
            <div className="number-display">
              <InputNumber
                readOnly
                className="readonly-number"
                value={formData.dispute_time_limit}
                formatter={(value) => `${value} дн.`}
                parser={(value) => value?.replace(' дн.', '') || ''}
              />
            </div>
          </Form.Item>
        </Col>
        {isWorkGroup && (
          <Col xs={12} sm={8} md={6}>
            <Form.Item name="workgroup" label={WorkGroupLabel}>
              <div className="number-display">
                <InputNumber
                  readOnly
                  className="readonly-number"
                  value={formData.workgroup}
                  formatter={(value) => `${value} чел.`}
                  parser={(value) => value?.replace(' чел.', '') || ''}
                />
              </div>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Card>
  );

  const renderBooleanSettings = () => (
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
          <Form.Item name="is_workgroup" label={IsWorkGroupLabel} valuePropName="checked">
            <div className="switch-display">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                disabled
                className="readonly-switch"
                checked={formData.is_workgroup}
              />
              <Text type="secondary" className="switch-label">
                {formData.is_workgroup ? 'Рабочая группа' : 'Обычное сообщество'}
              </Text>
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item name="is_secret_ballot" label={IsSecretBallotLabel} valuePropName="checked">
            <div className="switch-display">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                disabled
                className="readonly-switch"
                checked={formData.is_secret_ballot}
              />
              <Text type="secondary" className="switch-label">
                {formData.is_secret_ballot ? 'Включено' : 'Отключено'}
              </Text>
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item name="is_can_offer" label="Оказываем услуги другим сообществам" valuePropName="checked">
            <div className="switch-display">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                disabled
                className="readonly-switch"
                checked={formData.is_can_offer}
              />
              <Text type="secondary" className="switch-label">
                {formData.is_can_offer ? 'Да' : 'Нет'}
              </Text>
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item name="is_minority_not_participate" label={IsMinorityNotParticipateLabel} valuePropName="checked">
            <div className="switch-display">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                disabled
                className="readonly-switch"
                checked={formData.is_minority_not_participate}
              />
              <Text type="secondary" className="switch-label">
                {formData.is_minority_not_participate ? 'Да' : 'Нет'}
              </Text>
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderCategoriesAndResponsibilities = () => (
    <Card
      title={
        <Space>
          <TeamOutlined />
          <span>Категории и обязанности</span>
        </Space>
      }
      className="settings-section"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} lg={12}>
          <Form.Item name="categories" label={CategoriesLabel}>
            <div className="tags-display">
              <div className="tags-container">
                {/* Используем данные из состояния */}
                {formData.categories?.length > 0 ? (
                  formData.categories.map((category: string, index: number) => (
                    <Tag key={index} className="category-tag">
                      {category}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Категории не указаны</Text>
                )}
              </div>
            </div>
          </Form.Item>
        </Col>
        <Col xs={24} lg={12}>
          <Form.Item name="responsibilities" label={ResponsibilitiesLabel}>
            <div className="tags-display">
              <div className="tags-container">
                {/* Используем данные из состояния */}
                {formData.responsibilities?.length > 0 ? (
                  formData.responsibilities.map((responsibility: string, index: number) => (
                    <Tag key={index} className="responsibility-tag">
                      {responsibility}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Обязанности не указаны</Text>
                )}
              </div>
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  if (settingsLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text type="secondary" style={{ marginTop: 16 }}>
          Загрузка настроек сообщества...
        </Text>
      </div>
    );
  }

  return (
    <div className="community-settings-container">
      <div className="settings-header">
        <Title level={2} className="settings-title">
          Настройки сообщества
        </Title>
        <Text type="secondary" className="settings-subtitle">
          Просмотр параметров и конфигурации сообщества
        </Text>
      </div>
      {renderInfoCard()}

      <Form
        name="community-settings"
        form={form}
        layout="vertical"
        className="community-settings-form"
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {renderBasicInfo()}
          {renderVotingSettings()}
          {renderBooleanSettings()}
          {renderCategoriesAndResponsibilities()}
        </Space>
      </Form>
    </div>
  );
}