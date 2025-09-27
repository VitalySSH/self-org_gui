import { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  ExperimentOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  AuthContextProvider,
  ChallengeFormInterface,
  Pagination,
} from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import {
  CategoryLabel,
  CategorySelectedCode,
  NewChallengeCode,
  SystemCategoryCode,
} from 'src/consts';
import { CustomSelect, AdvancedEditor } from 'src/components';
import {
  CategoryModel,
  ChallengeModel,
  SolutionModel,
  SolutionVersionModel,
  StatusModel,
} from 'src/models';
import { Filters } from 'src/shared/types.ts';
import './new-challenge.page.scss';
import { useAuth } from 'src/hooks';

const { Title, Text } = Typography;

interface NewChallengeProps {
  communityId: string;
}

export function NewChallenge(props: NewChallengeProps) {
  const authData: AuthContextProvider = useAuth();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [buttonLoading, setButtonLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [hasInitialSolution, setHasInitialSolution] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  const statusService = new CrudDataSourceService(StatusModel);
  const categoryService = new CrudDataSourceService(CategoryModel);

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

  const handleDescriptionEditorChange = (value: string) => {
    form.setFieldValue('description', value);
    handleFormChange();
  };

  const handleSolutionEditorChange = (value: string) => {
    form.setFieldValue('initial_solution', value);
    handleFormChange();
  };

  const handleFormChange = () => {
    const formData = form.getFieldsValue();
    setHasInitialSolution(Boolean(formData.has_initial_solution));

    const isValidSolution = formData.has_initial_solution
      ? Boolean(formData.initial_solution)
      : true;

    const isValid =
      Boolean(formData.title) &&
      Boolean(formData.description) &&
      Boolean(formData.category) &&
      isValidSolution;

    setDisabled(!isValid);

    // Обновляем прогресс
    const requiredFields = ['title', 'description', 'category'];
    const filledFields = requiredFields.filter((field) => {
      const value = formData[field];
      return value && (typeof value === 'string' ? value.trim() : true);
    });

    // Учитываем начальное решение, если включено
    if (formData.has_initial_solution) {
      requiredFields.push('initial_solution');
      if (formData.initial_solution?.trim()) {
        filledFields.push('initial_solution');
      }
    }

    const progress = Math.round(
      (filledFields.length / requiredFields.length) * 100
    );
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

  const onCancel = () => {
    navigate(-1);
  };

  const onFinish = async () => {
    setButtonLoading(true);

    try {
      const formData: ChallengeFormInterface = form.getFieldsValue();

      // Создаем задачу
      const challengeService = new CrudDataSourceService(ChallengeModel);
      const challenge = challengeService.createRecord();

      challenge.title = formData.title;
      challenge.creator = authData.getUserRelation();
      challenge.description = formData.description;
      challenge.community_id = props.communityId;
      challenge.category = formData.category;

      const statuses = await statusService.list([
        {
          field: 'code',
          op: 'equals',
          val: NewChallengeCode,
        },
      ]);

      if (statuses.total) {
        challenge.status = statuses.data[0];
      }

      const savedChallenge = await challengeService.save(challenge, true);

      // Если есть начальное решение, создаем его
      if (formData.has_initial_solution && formData.initial_solution) {
        // Создаем решение
        const solutionService = new CrudDataSourceService(SolutionModel);
        const solution = solutionService.createRecord();

        solution.challenge = savedChallenge;
        solution.user_id = authData.user?.id;
        solution.current_content = formData.initial_solution;

        const savedSolution = await solutionService.save(solution, true);

        // Создаем первую версию решения
        const versionService = new CrudDataSourceService(SolutionVersionModel);
        const version = versionService.createRecord();

        version.solution = savedSolution;
        version.content = formData.initial_solution;
        version.change_description = 'Первоначальная версия от автора задачи';
        version.version_number = 1;

        await versionService.save(version, true);
      }

      successInfo('Задача успешно создана');
      navigate(-1);
    } catch (error) {
      console.error('Error creating challenge:', error);
      errorInfo(`Ошибка создания задачи: ${error}`);
    } finally {
      setButtonLoading(false);
    }
  };

  const getFormStatus = () => {
    if (disabled) return 'Требуется заполнение';
    return 'Готово к созданию';
  };

  return (
    <div className="new-challenge-page">
      {contextHolder}

      <div className="form-page-container">
        {/* Заголовок */}
        <Card className="form-header-card" variant="borderless">
          <div className="form-header-icon">
            <ExperimentOutlined />
          </div>
          <Title level={2} className="form-header-title">
            Создание новой задачи
          </Title>
          <Text className="form-header-subtitle">
            Создайте задачу для коллективного решения в лаборатории сообщества.
            Опишите проблему, которую невозможно или сложно решить в
            одиночку, и получите помощь от участников сообщества с поддержкой ИИ.
          </Text>
        </Card>

        {/* Основная форма */}
        <Card className="form-main-card" variant="borderless">
          <Form
            form={form}
            name="new-challenge"
            layout="vertical"
            onFieldsChange={handleFormChange}
            initialValues={{
              has_initial_solution: false,
            }}
          >
            <Form.Item
              name="title"
              label={
                <span>
                  Название задачи
                  <Tooltip title="Введите краткое, но понятное название задачи. Максимум 200 символов.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, укажите название задачи',
                },
                {
                  max: 200,
                  message: 'Название не должно превышать 200 символов',
                },
              ]}
              hasFeedback
            >
              <Input placeholder="Введите название задачи..." />
            </Form.Item>

            <Form.Item
              name="category"
              label={
                <span>
                  {CategoryLabel}
                  <Tooltip title="Выберите категорию, к которой относится ваша задача.">
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
              name="description"
              label={
                <span>
                  Подробное описание задачи
                  <Tooltip title="Детально опишите задачу, проблему которую нужно решить, ожидаемый результат. Можно использовать код, формулы, схемы. Максимум 2000 символов.">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, подробно опишите задачу',
                },
                {
                  max: 2000,
                  message: 'Описание не должно превышать 2000 символов',
                },
              ]}
              hasFeedback
            >
              <AdvancedEditor
                placeholder="Подробно опишите задачу, проблему, ожидаемый результат. Вы можете использовать Markdown разметку, вставлять код, формулы..."
                maxLength={2000}
                minHeight={200}
                onChange={handleDescriptionEditorChange}
              />
            </Form.Item>

            <Form.Item
              name="has_initial_solution"
              label={
                <span>
                  У меня есть начальное решение
                  <Tooltip title="Включите эту опцию, если у вас уже есть начальный вариант решения, которым вы хотите поделиться как отправной точкой для совместной работы.">
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

            {hasInitialSolution && (
              <div className="initial-solution-section">
                <div className="section-title">
                  <FileTextOutlined />
                  Ваше начальное решение
                </div>

                <Form.Item
                  name="initial_solution"
                  label={
                    <span>
                      Начальное решение или идея
                      <Tooltip title="Поделитесь вашим начальным вариантом решения, идеями, подходами. Это поможет другим участникам лучше понять направление работы. Максимум 3000 символов.">
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Пожалуйста, опишите ваше начальное решение',
                    },
                    {
                      max: 3000,
                      message: 'Решение не должно превышать 3000 символов',
                    },
                  ]}
                  hasFeedback
                >
                  <AdvancedEditor
                    placeholder="Опишите ваше начальное решение, идеи, подходы, код, алгоритмы..."
                    maxLength={3000}
                    minHeight={300}
                    onChange={handleSolutionEditorChange}
                  />
                </Form.Item>
              </div>
            )}
          </Form>
        </Card>
      </div>

      <div className="toolbar">
        <div className="toolbar-info-left">
          <div className="toolbar-info">
            <FileTextOutlined className="info-icon" />
            <span className="info-text">
              Прогресс: <span className="info-highlight">{formProgress}%</span>
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
            Отмена
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={buttonLoading}
            onClick={() => onFinish()}
            disabled={disabled}
            className="toolbar-button toolbar-button-primary"
            icon={<SaveOutlined />}
          >
            Создать задачу
          </Button>
        </div>

        <div className="toolbar-info-right">
          {/* Пока пустая, можно добавить дополнительную информацию */}
        </div>
      </div>
    </div>
  );
}
