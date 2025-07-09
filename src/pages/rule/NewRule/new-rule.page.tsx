import { Button, Form, Input, message, Space, Switch, Tooltip } from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import {
  CreatingRuleInterface,
  Pagination,
  RuleFormInterface,
} from 'src/interfaces';
import { CrudDataSourceService, RuleAoService } from 'src/services';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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

export function NewRule(props: any) {
  const communityId = props.communityId;

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isExtraOptions, setIsExtraOptions] = useState(false);
  const [isCheckingResponsibility, setIsCheckingResponsibility] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);

  const categoryService = new CrudDataSourceService(CategoryModel);
  const ruleAoService = new RuleAoService();

  const [form] = Form.useForm();

  const successInfo = (content: string) => {
    messageApi
      .open({
        type: 'success',
        content: content,
      })
      .then();
  };

  const errorInfo = (content: string) => {
    messageApi
      .open({
        type: 'error',
        content: content,
      })
      .then();
  };

  const onCustomSelectChange = (fieldName: string, value: any) => {
    form.setFieldValue(fieldName, value);
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
  };

  const fetchCategories = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    const newFilters: Filters = filters || [];
    newFilters.push({
      field: 'community_id',
      op: 'equals',
      val: communityId,
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

  const extraOptions = (
    <>
      <Form.Item
        name="extra_question"
        label={
          <span>
            Вопрос для дополнительных параметров&nbsp;
            <Tooltip title="Сформулируйте вопрос для определения дополнительных параметров голосования. Максимум 140 символов.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        labelCol={{ span: 24 }}
        rules={[
          {
            required: true,
            message:
              'Пожалуйста, укажите вопрос, на которой должны ответить при голосовании',
          },
          {
            max: 140,
            message: 'Текст вопроса не должен превышать 140 символов',
          },
        ]}
        hasFeedback
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="is_multi_select"
        label={
          <span>
            {IsMultiSelectLabel}&nbsp;
            <Tooltip title="При включении этой опции итоговое решение может включать несколько вариантов, соответствующих установленным критериям. По умолчанию выбирается один наиболее популярный вариант.">
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
      <Form.List name="extra_options">
        {(fields, { add, remove }) => (
          <div className="form-list-input">
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{
                  display: 'flex',
                  marginBottom: 8,
                  width: '100%',
                }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  labelCol={{ span: 24 }}
                  name={[name, 'name']}
                  rules={[
                    {
                      required: true,
                      message:
                        'Пожалуйста, укажите дополнительный параметр для голосования',
                    },
                  ]}
                  hasFeedback
                >
                  <Input placeholder="Параметр" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="primary"
                onClick={() => add()}
                icon={<PlusOutlined />}
              >
                Добавить параметр
              </Button>
            </Form.Item>
          </div>
        )}
      </Form.List>
    </>
  );

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
      community_id: communityId,
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

  return (
    <>
      <div className="form-container">
        {contextHolder}

        <ResponsibilityCheckModal
          visible={isCheckingResponsibility}
          onClose={() => setIsCheckingResponsibility(false)}
          onComplete={onFinish}
        />

        <div className="form-header">
          <div>Новое правило</div>
          <Button
            type="default"
            icon={<RobotOutlined />}
            onClick={() => setIsAIMode(true)}
            className="ai-mode-button"
          >
            ИИ-режим
          </Button>
        </div>

        <Form
          form={form}
          name="new-rule"
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
                Заголовок&nbsp;
                <Tooltip title="Введите текст, который будет передавать суть вашего правила. Максимум 140 символов.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
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
            <Input />
          </Form.Item>
          <Form.Item
            name="question"
            label={
              <span>
                Закрытый вопрос для голосования&nbsp;
                <Tooltip title="Сформулируйте закрытый вопрос для голосования, на который можно ответить только «да» или «нет». Максимум 140 символов.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите вопрос, на который должны ответить при голосовании',
              },
              {
                max: 140,
                message: 'Текст вопроса не должен превышать 140 символов',
              },
            ]}
            hasFeedback
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label={
              <span>
                Описание правила&nbsp;
                <Tooltip title="Расскажите подробно суть вашего правила, с какой целью оно предлагается и как оно поможет сделать наше сообщество лучше. Максимум 1 000 символов.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, подробно опишите цель и содержание правила',
              },
              {
                max: 1000,
                message:
                  'Текст описания правила не должен превышать 1000 символов',
              },
            ]}
            hasFeedback
          >
            <TextArea rows={5} />
          </Form.Item>
          <Form.Item
            name="category"
            label={
              <span>
                {CategoryLabel}&nbsp;
                <Tooltip title="Укажите категорию для вашего правила, чтобы обеспечить структурирование и облегчить поиск правил.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
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
            />
          </Form.Item>
          <Form.Item
            name="is_extra_options"
            label={
              <span>
                {IsExtraOptionsLabel}&nbsp;
                <Tooltip title="Включите эту опцию, если ответ на ваш вопрос предполагает более широкие варианты, выходящие за рамки стандартных Да или Нет.">
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
          {isExtraOptions && extraOptions}
        </Form>
      </div>
      <div className="toolbar">
        <Button
          type="primary"
          htmlType="submit"
          loading={buttonLoading}
          onClick={() => setIsCheckingResponsibility(true)}
          disabled={disabled}
          className="toolbar-button"
        >
          Создать правило
        </Button>
        <Button
          type="primary"
          htmlType="button"
          onClick={onCancel}
          className="toolbar-button"
        >
          Назад
        </Button>
      </div>
    </>
  );
}