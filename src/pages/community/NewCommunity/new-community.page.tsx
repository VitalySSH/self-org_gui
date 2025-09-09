import { Button, Form, message, Typography, Space, Card } from 'antd';
import { UserSettingsAoService } from 'src/services';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { NewCommunityForm } from 'src/components';
import {
  TeamOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import './new-community.page.scss';

const { Title, Text } = Typography;
// const { Step } = Steps;

export function NewCommunity() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const [form] = Form.useForm();

  const errorInfo = (content: string) => {
    messageApi.open({
      type: 'error',
      content: content,
    });
  };

  const successInfo = (content: string) => {
    messageApi.open({
      type: 'success',
      content: content,
    });
  };

  const onFinish = async () => {
    setButtonLoading(true);

    try {
      const { name, description, ...formData } = form.getFieldsValue();

      const communityData = {
        names: [name],
        descriptions: [description],
        ...formData,
      };

      const userSettingsAOService = new UserSettingsAoService();
      await userSettingsAOService.createCommunity(communityData);

      successInfo('Сообщество успешно создано!');

      setTimeout(() => {
        navigate('/communities', { preventScrollReset: true });
      }, 1000);
    } catch (error) {
      console.error('Error creating community:', error);
      errorInfo(`Ошибка создания сообщества: ${error}`);
    } finally {
      setButtonLoading(false);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  const renderHeader = () => (
    <div className="page-header">
      <div className="header-content">
        <div className="header-main">
          <div className="header-icon">
            <TeamOutlined />
          </div>
          <div className="header-text">
            <Title level={1} className="page-title">
              Создание нового сообщества
            </Title>
            <Text type="secondary" className="page-subtitle">
              Настройте параметры и правила для вашего сообщества
            </Text>
          </div>
        </div>

        {/*<div className="header-steps">*/}
        {/*  <Steps size="small" current={0}>*/}
        {/*    <Step*/}
        {/*      title="Настройка"*/}
        {/*      icon={<SettingOutlined />}*/}
        {/*      description="Заполните форму"*/}
        {/*    />*/}
        {/*    <Step*/}
        {/*      title="Создание"*/}
        {/*      icon={<CheckCircleOutlined />}*/}
        {/*      description="Подтвердите создание"*/}
        {/*    />*/}
        {/*  </Steps>*/}
        {/*</div>*/}
      </div>
    </div>
  );

  const renderInfoCard = () => (
    <Card className="info-card" size="small">
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div className="info-item">
          <InfoCircleOutlined className="info-icon" />
          <Text strong>Все поля обязательны для заполнения</Text>
        </div>
        <div className="info-item">
          <SettingOutlined className="info-icon" />
          <Text type="secondary">
            Настройки можно будет изменить позже в панели управления
          </Text>
        </div>
      </Space>
    </Card>
  );

  // Получаем количество заполненных полей для отображения прогресса
  const getFormProgress = () => {
    const formData = form.getFieldsValue();
    const requiredFields = [
      'name',
      'description',
      'quorum',
      'vote',
      'significant_minority',
      'decision_delay',
      'dispute_time_limit',
    ];
    const filledFields = requiredFields.filter(
      (field) => formData[field] && formData[field] !== ''
    );
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  const getFormStatus = () => {
    if (disabled) return 'В процессе заполнения';
    return 'Готово к созданию';
  };

  return (
    <div className="new-community-page">
      {contextHolder}

      {renderHeader()}

      <div className="page-content">
        <div className="content-container">
          {renderInfoCard()}

          <div className="form-container">
            <NewCommunityForm form={form} setDisabledButton={setDisabled} />
          </div>
        </div>
      </div>

      {/* Toolbar с кнопками */}
      <div className="toolbar">
        <div className="toolbar-info-left">
          <div className="toolbar-info">
            <SettingOutlined className="info-icon" />
            <span className="info-text">
              Прогресс:{' '}
              <span className="info-highlight">{getFormProgress()}%</span>
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
            Назад
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={buttonLoading}
            onClick={onFinish}
            disabled={disabled}
            className="toolbar-button toolbar-button-primary"
            icon={<CheckCircleOutlined />}
          >
            Создать сообщество
          </Button>
        </div>

        <div className="toolbar-info-right">
          {/*<div className="toolbar-info">*/}
          {/*  <ClockCircleOutlined className="info-icon" />*/}
          {/*  <span className="info-text">*/}
          {/*    Этап: <span className="info-highlight">Настройка</span>*/}
          {/*  </span>*/}
          {/*</div>*/}
          {/*<div className="toolbar-meta">*/}
          {/*  Шаг 1 из 2*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
}
