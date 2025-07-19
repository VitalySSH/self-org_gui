import { useState } from 'react';
import { Button, Card, Form, Input, message, Switch, Tooltip, Typography } from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  FileTextOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { useNavigate } from 'react-router-dom';
import {
  CreatingRuleInterface,
  Pagination,
  RuleFormInterface,
} from 'src/interfaces';
import { CrudDataSourceService, RuleAoService } from 'src/services';
import {
  CategoryLabel,
  CategorySelectedCode,
  IsExtraOptionsLabel,
  IsMultiSelectLabel,
  SystemCategoryCode,
} from 'src/consts';
import { AIChat, CustomSelect, ResponsibilityCheckModal } from 'src/components';
import { CategoryModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import './new-rule.page.scss';

const { Title, Text } = Typography;

interface NewRuleProps {
  communityId: string;
}

export function NewRule(props: NewRuleProps) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isExtraOptions, setIsExtraOptions] = useState(false);
  const [isCheckingResponsibility, setIsCheckingResponsibility] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  const categoryService = new CrudDataSourceService(CategoryModel);
  const ruleAoService = new RuleAoService();

  const [form] = Form.useForm();

  const successInfo = (content: string) => {
    messageApi.open({
      type: 'success',
      content: content,
    }).then();
  };

  const errorInfo = (content: string) => {
    messageApi.open({
      type: 'error',
      content: content,
    }).then();
  };

  const onCustomSelectChange = (fieldName: string, value: any) => {
    form.setFieldValue(fieldName, value);
    handleFormChange();
  };

  const handleFormChange = () => {
    const formData = form.getFieldsValue();
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

    // Обновляем прогресс
    const requiredFields = ['title', 'question', 'content', 'category'];
    const filledFields = requiredFields.filter(field => {
      const value = formData[field];
      return value && (typeof value === 'string' ? value.trim() : true);
    });
    const progress = Math.round((filledFields.length / requiredFields.length) * 100);
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

    return categoryService.list(newFilters, undefined, pagination);
  };

  const handleAIComplete = (aiData: RuleFormInterface) => {
    // Заполняем форму данными от ИИ
    form.setFieldsValue(aiData);
    setIsExtraOptions(Boolean(aiData.is_extra_options));
    setIsAIMode(false);

    // Принудительно вызываем проверку валидности формы
    setTimeout(() => {
      handleFormChange();
    }, 100);
  };

  const onCancel = () => {
    navigate(-1);
  };

  const onFinish = () => {
    setButtonLoading(true);
    const formData: RuleFormInterface = form.getFieldsValue();
    if (formData.question[formData.question.length - 1] !== '?') {
      formData.question += '?';
    }
    if (
      formData.extra_question &&
      formData.extra_question[formData.extra_question.length - 1] !== '?'
    ) {
      formData.extra_question += '?';
    }
    const ruleData: CreatingRuleInterface = {
      title: formData.title,
      question: formData.question,
      extra_question: formData.extra_question,
      content: formData.content,
      is_extra_options: formData.is_extra_options,
      is_multi_select: formData.is_multi_select || false,
      community_id: props.communityId,
      category_id: formData.category.id,
      extra_options: (formData.extra_options || []).map((it) => it.name),
    };

    ruleAoService
      .createRule(ruleData)
      .then(() => {
        successInfo('Правило создано');
        navigate(-1);
      })
      .catch((error) => {
        errorInfo(`Ошибка создания правила: ${error}`);
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

  const getFormStatus = () => {
    if (disabled) return 'Требуется заполнение';
    return 'Готово к созданию';
  };

  // const getSelectedCategory = () => {
  //   const formData = form.getFieldsValue();
  //   return formData.category?.name || 'Не выбрана';
  // };

  // const getExtraOptionsCount = () => {
  //   const formData = form.getFieldsValue();
  //   return (formData.extra_options || []).length;
  // };

  return (
    <div className="new-rule-page">
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
            <FileTextOutlined />
          </div>
          <Title level={2} className="form-header-title">
            Создание нового правила
          </Title>
          <Text className="form-header-subtitle">
            Создайте правило для сообщества, которое будет вынесено на голосование. Определите основные параметры и дополнительные опции
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
            name="new-rule"
            layout="vertical"
            onFieldsChange={handleFormChange}
            initialValues={{
              is_extra_options: false,
              is_multi_select: false,
            }}
          >
            <Form.Item
              name="title"
              label={
                <span>
                  Заголовок
                  <Tooltip title="Введите текст, который будет передавать суть вашего правила. Максимум 140 символов.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, укажите заголовок для правила',
                },
                {
                  max: 140,
                  message: 'Текст заголовка не должен превышать 140 символов',
                },
              ]}
              hasFeedback
            >
              <Input placeholder="Введите заголовок правила..." />
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
                  Описание правила
                  <Tooltip title="Расскажите подробно суть вашего правила, с какой целью оно предлагается и как оно поможет сделать наше сообщество лучше. Максимум 1 000 символов.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, подробно опишите цель и содержание правила',
                },
                {
                  max: 1000,
                  message: 'Текст описания правила не должен превышать 1000 символов',
                },
              ]}
              hasFeedback
            >
              <TextArea
                rows={5}
                placeholder="Подробно опишите ваше правило, его цель и преимущества..."
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={
                <span>
                  {CategoryLabel}
                  <Tooltip title="Укажите категорию для вашего правила, чтобы обеспечить структурирование и облегчить поиск правил.">
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
                onClick={() => setIsCheckingResponsibility(true)}
                disabled={disabled}
                className="toolbar-button"
              >
                Создать правило
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
            <FileTextOutlined className="info-icon" />
            <span className="info-text">
              Прогресс: <span className="info-highlight">{formProgress}%</span>
            </span>
          </div>
          <div className={`toolbar-status ${disabled ? 'status-warning' : 'status-success'}`}>
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
            onClick={() => setIsCheckingResponsibility(true)}
            disabled={disabled}
            className="toolbar-button toolbar-button-primary"
            icon={<SaveOutlined />}
          >
            Создать правило
          </Button>
        </div>

        <div className="toolbar-info-right">
          {/*<div className="toolbar-info">*/}
          {/*  <ClockCircleOutlined className="info-icon" />*/}
          {/*  <span className="info-text">*/}
          {/*    Тип: <span className="info-highlight">Правило</span>*/}
          {/*  </span>*/}
          {/*</div>*/}
          {/*{isExtraOptions && (*/}
          {/*  <div className="toolbar-status status-success">*/}
          {/*    <SettingOutlined className="status-icon" />*/}
          {/*    <span>Доп. опции: {getExtraOptionsCount()}</span>*/}
          {/*  </div>*/}
          {/*)}*/}
          {/*<div className="toolbar-meta">*/}
          {/*  Категория: {getSelectedCategory()}*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
}