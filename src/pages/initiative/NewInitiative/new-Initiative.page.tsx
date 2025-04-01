import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import {
  CreatingInitiativeInterface,
  InitiativeFormInterface,
  Pagination,
} from 'src/interfaces';
import { CrudDataSourceService, InitiativeAoService } from 'src/services';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  CategoryLabel,
  CategorySelectedCode,
  IsExtraOptionsLabel,
  IsMultiSelectLabel,
  OneDayEventLabel,
  SystemCategoryCode,
} from 'src/consts';
import { CustomSelect } from 'src/components';
import { CategoryModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';

export function NewInitiative(props: any) {
  const communityId = props.communityId;

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isOneDayEvent, setIsOneDayEvent] = useState(false);
  const [isExtraOptions, setIsExtraOptions] = useState(false);

  const categoryService = new CrudDataSourceService(CategoryModel);
  const initiativeAoService = new InitiativeAoService();

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
      val: communityId,
    });
    newFilters.push({
      field: 'status.code',
      op: 'in',
      val: [CategorySelectedCode, SystemCategoryCode],
    });

    return categoryService.list(newFilters, undefined, pagination);
  };

  const extraOptions = (
    <>
      <Form.Item
        name="extra_question"
        label={
          <span>
            Вопрос для дополнитеных параметров&nbsp;
            <Tooltip title="Сформулируйте вопрос для определения дополнитеных параметров голосования. Максимум 140 символов.">
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
            message: 'Текст вопроса не должен привышать 140 символов',
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
            <Tooltip title="Включите эту опцию, если при голосовании возможен выбор нескольких вариантов ответов.">
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
                type="dashed"
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
      community_id: communityId,
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

  return (
    <>
      <div className="form-container">
        {contextHolder}
        <div className="form-header">Новая инициатива</div>
        <Form
          form={form}
          name="new-initiative"
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
                Заголовок&nbsp;
                <Tooltip title="Введите текст, который будет передавать суть вашей инициативы. Максимум 140 символов.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, укажите заголовок для инициативы',
              },
              {
                max: 140,
                message: 'Текст заголовка не должен привышать 140 символов',
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
                  'Пожалуйста, укажите вопрос, на которой должны ответить при голосовании',
              },
              {
                max: 140,
                message: 'Текст вопроса не должен привышать 140 символов',
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
                Описание инициативы&nbsp;
                <Tooltip title="Расскажите подробно суть вашей инициативы, с какой целью предлагается её реализация и как она поможет сделать наше сообщество лучше. Максимум 1 000 символов.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, подробно опишите цель и содержание инициативы',
              },
              {
                max: 1000,
                message:
                  'Текст описания инициативы не должен привышать 1000 символов',
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
                <Tooltip title="Укажите категорию для вашей инициативы, чтобы обеспечить структурирование и облегчить поиск инициатив.">
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
            name="is_one_day_event"
            label={
              <span>
                {OneDayEventLabel}&nbsp;
                <Tooltip title="Включите этот признак, если реализация вашей инициативы привязана к какой-то одной конкретной дате и её результат не будет иметь долгосрочных последствий затрагивающих сообщество.">
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
          {isOneDayEvent && (
            <Form.Item
              name="event_date"
              label={
                <span>
                  {OneDayEventLabel}&nbsp;
                  <Tooltip title="Выбирите дату события. В этот день голосование по инициативе будет навсегда завершено.">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelCol={{ span: 24 }}
              rules={[
                { required: true, message: 'Пожалуйста, выберите дату.' },
              ]}
            >
              <DatePicker format="DD.MM.YYYY" />
            </Form.Item>
          )}
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
          onClick={onFinish}
          disabled={disabled}
          className="toolbar-button"
        >
          Создать инициативу
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
