import { useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  BulbOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { useNavigate } from 'react-router-dom';
import {
  CreatingInitiativeInterface,
  InitiativeFormInterface,
  Pagination,
  RuleFormInterface,
} from 'src/interfaces';
import { CrudDataSourceService, InitiativeAoService } from 'src/services';
import {
  CategoryLabel,
  CategorySelectedCode,
  IsExtraOptionsLabel,
  IsMultiSelectLabel,
  OneDayEventLabel,
  SystemCategoryCode,
} from 'src/consts';
import { AIChat, CustomSelect, ResponsibilityCheckModal } from 'src/components';
import { CategoryModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import './new-Initiative.page.scss';

const { Title, Text } = Typography;

interface NewInitiativeProps {
  communityId: string;
}

export function NewInitiative(props: NewInitiativeProps) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isOneDayEvent, setIsOneDayEvent] = useState(false);
  const [isExtraOptions, setIsExtraOptions] = useState(false);
  const [isCheckingResponsibility, setIsCheckingResponsibility] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);

  const categoryService = new CrudDataSourceService(CategoryModel);
  const initiativeAoService = new InitiativeAoService();

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
    setIsOneDayEvent(Boolean(formData.is_one_day_event));
    setIsExtraOptions(Boolean(formData.is_extra_options));
    const isValidOptions = formData.is_extra_options
      ? (formData.extra_options || []).length > 0
      : true;
    const isValid =
      Boolean(formData.title) &&
      Boolean(formData.question) &&
      Boolean(formData.content) &&
      Boolean(formData.category) &&
      isValidOptions;
    setDisabled(!isValid);
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

    return categoryService.list(newFilters, undefined, pagination);
  };

  const handleAIComplete = (aiData: RuleFormInterface) => {
    form.setFieldsValue(aiData);
    setIsExtraOptions(Boolean(aiData.is_extra_options));
    setIsAIMode(false);

    setTimeout(() => {
      handleFormChange();
    }, 100);
  };

  const onCancel = () => {
    navigate(-1);
  };

  const onFinish = () => {
    setButtonLoading(true);
    const formData: InitiativeFormInterface = form.getFieldsValue();
    if (formData.question[formData.question.length - 1] !== '?') {
      formData.question += '?';
    }
    if (
      formData.extra_question &&
      formData.extra_question[formData.extra_question.length - 1] !== '?'
    ) {
      formData.extra_question += '?';
    }
    const initiativeData: CreatingInitiativeInterface = {
      title: formData.title,
      question: formData.question,
      extra_question: formData.extra_question,
      content: formData.content,
      is_one_day_event: formData.is_one_day_event,
      event_date: formData.event_date
        ? formData.event_date.toISOString()
        : null,
      is_extra_options: formData.is_extra_options,
      is_multi_select: formData.is_multi_select || false,
      community_id: props.communityId,
      category_id: formData.category.id,
      extra_options: (formData.extra_options || []).map((it) => it.name),
    };

    initiativeAoService
      .createInitiative(initiativeData)
      .then(() => {
        successInfo('Инициатива создана');
        navigate(-1);
      })
      .catch((error) => {
        errorInfo(`Ошибка создания инициативы: ${error}`);
      })
      .finally(() => setButtonLoading(false));
  };

  // Если включен AI режим, показываем чат
  if (isAIMode) {
    return (
      <AIChat
        onComplete={handleAIComplete}
        onCancel={() => setIsAIMode(false)}
        fetchCategories={fetchCategories}
      />
    );
  }

  const renderEventDateSection = () => (
    <div className="event-date-section">
      <div className="section-title">
        <CalendarOutlined />
        Дата проведения события
      </div>

      <Form.Item
        name="event_date"
        label={
          <span>
            Дата события
            <Tooltip title="Выберите дату события. В этот день голосование по инициативе будет навсегда завершено.">
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </span>
        }
        rules={[
          { required: true, message: 'Пожалуйста, выберите дату события.' },
        ]}
        hasFeedback
      >
        <DatePicker
          format="DD.MM.YYYY"
          placeholder="Выберите дату события..."
          style={{ width: '100%' }}
        />
      </Form.Item>
    </div>
  );

  const renderExtraOptions = () => (
    <div className="extra-options-section">
      <div className="section-title">
        <SettingOutlined />
        Дополнительные параметры голосования
      </div>

      <Form.Item
        name="extra_question"
        label={
          <span>
            Вопрос для дополнительных параметров
            <Tooltip title="Сформулируйте вопрос для определения дополнительных параметров голосования. Максимум 140 символов.">
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </span>
        }
        rules={[
          {
            required: true,
            message: 'Пожалуйста, укажите вопрос, на который должны ответить при голосовании',
          },
          {
            max: 140,
            message: 'Текст вопроса не должен превышать 140 символов',
          },
        ]}
        hasFeedback
      >
        <Input placeholder="Введите вопрос для дополнительных параметров..." />
      </Form.Item>

      <Form.Item
        name="is_multi_select"
        label={
          <span>
            {IsMultiSelectLabel}
            <Tooltip title="При включении этой опции итоговое решение может включать несколько вариантов, соответствующих установленным критериям. По умолчанию выбирается один наиболее популярный вариант.">
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </span>
        }
        valuePropName="checked"
      >
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      </Form.Item>

      <Form.List name="extra_options">
        {(fields, { add, remove }) => (
          <div style={{ width: '100%' }}>
            <Text strong style={{ display: 'block', marginBottom: 16 }}>Варианты ответов:</Text>

            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  width: '100%'
                }}
              >
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  rules={[{ required: true, message: 'Пожалуйста, укажите дополнительный параметр для голосования' }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input
                    placeholder="Введите вариант ответа..."
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <MinusCircleOutlined
                  onClick={() => remove(name)}
                  style={{ color: '#ff4d4f', fontSize: 16, flexShrink: 0 }}
                />
              </div>
            ))}

            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              block
            >
              Добавить вариант ответа
            </Button>
          </div>
        )}
      </Form.List>
    </div>
  );

  return (
    <div className="new-initiative-page">
      {contextHolder}

      <ResponsibilityCheckModal
        visible={isCheckingResponsibility}
        onClose={() => setIsCheckingResponsibility(false)}
        onComplete={onFinish}
      />

      <div className="form-page-container">
        {/* Заголовок */}
        <Card className="form-header-card" variant="borderless">
          <div className="form-header-icon">
            <BulbOutlined />
          </div>
          <Title level={2} className="form-header-title">
            Создание новой инициативы
          </Title>
          <Text className="form-header-subtitle">
            Создайте инициативу для сообщества, которая будет вынесена на голосование. Определите основные параметры, дату события и дополнительные опции
          </Text>
          <div className="header-actions">
            <Button
              type="default"
              icon={<RobotOutlined />}
              onClick={() => setIsAIMode(true)}
              className="ai-button"
            >
              ИИ-режим
            </Button>
          </div>
        </Card>

        {/* Основная форма */}
        <Card className="form-main-card" variant="borderless">
          <Form
            form={form}
            name="new-initiative"
            layout="vertical"
            onFieldsChange={handleFormChange}
            initialValues={{
              is_one_day_event: false,
              is_extra_options: false,
              is_multi_select: false,
            }}
          >
            <Form.Item
              name="title"
              label={
                <span>
                  Заголовок
                  <Tooltip title="Введите текст, который будет передавать суть вашей инициативы. Максимум 140 символов.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, укажите заголовок для инициативы',
                },
                {
                  max: 140,
                  message: 'Текст заголовка не должен превышать 140 символов',
                },
              ]}
              hasFeedback
            >
              <Input placeholder="Введите заголовок инициативы..." />
            </Form.Item>

            <Form.Item
              name="question"
              label={
                <span>
                  Закрытый вопрос для голосования
                  <Tooltip title="Сформулируйте закрытый вопрос для голосования, на который можно ответить только «да» или «нет». Максимум 140 символов.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, укажите вопрос, на который должны ответить при голосовании',
                },
                {
                  max: 140,
                  message: 'Текст вопроса не должен превышать 140 символов',
                },
              ]}
              hasFeedback
            >
              <Input placeholder="Введите вопрос для голосования..." />
            </Form.Item>

            <Form.Item
              name="content"
              label={
                <span>
                  Описание инициативы
                  <Tooltip title="Расскажите подробно суть вашей инициативы, с какой целью предлагается её реализация и как она поможет сделать наше сообщество лучше. Максимум 1 000 символов.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, подробно опишите цель и содержание инициативы',
                },
                {
                  max: 1000,
                  message: 'Текст описания не должен превышать 1000 символов',
                },
              ]}
              hasFeedback
            >
              <TextArea
                rows={5}
                placeholder="Подробно опишите вашу инициативу, её цель и преимущества..."
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={
                <span>
                  {CategoryLabel}
                  <Tooltip title="Укажите категорию для вашей инициативы, чтобы обеспечить структурирование и облегчить поиск инициатив.">
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
                fieldService={categoryService}
                requestOptions={fetchCategories}
                onChange={onCustomSelectChange}
                formField="category"
                bindLabel="name"
                enableSearch={true}
                label="Выберите категорию..."
              />
            </Form.Item>

            <Form.Item
              name="is_one_day_event"
              label={
                <span>
                  {OneDayEventLabel}
                  <Tooltip title="Включите этот признак, если реализация вашей инициативы привязана к какой-то одной конкретной дате и её результат не будет иметь долгосрочных последствий затрагивающих сообщество.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
              />
            </Form.Item>

            {isOneDayEvent && renderEventDateSection()}

            <Form.Item
              name="is_extra_options"
              label={
                <span>
                  {IsExtraOptionsLabel}
                  <Tooltip title="Включите эту опцию, если ответ на ваш вопрос предполагает более широкие варианты, выходящие за рамки стандартных Да или Нет.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
              />
            </Form.Item>

            {isExtraOptions && renderExtraOptions()}
          </Form>
        </Card>

        {/* Панель инструментов */}
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
                onClick={() => setIsCheckingResponsibility(true)}
                disabled={disabled}
                className="toolbar-button"
              >
                Создать инициативу
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}