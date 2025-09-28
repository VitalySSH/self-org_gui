import { useState, useEffect } from 'react';
import { Modal, Button, Card, Radio, Input, message, Tabs, Badge } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SendOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { SolutionModel, SolutionVersionModel } from 'src/models';
import { LlmApiService } from 'src/services';
import {
  IdeasResponse,
  ImprovementsResponse,
  CriticismResponse,
  ItemResponse,
  IntegrationResponse,
} from 'src/interfaces';
import './ai-response-modal.component.scss';
import { ItemResponseType } from 'src/shared/types.ts';

const { TextArea } = Input;

interface UserSolution {
  solution: SolutionModel;
  currentVersion: SolutionVersionModel;
  allVersions: SolutionVersionModel[];
}

interface AIResponseModalProps {
  visible: boolean;
  onCancel: () => void;
  responseData: IdeasResponse | ImprovementsResponse | CriticismResponse | null;
  interactionType: 'ideas' | 'improvements' | 'criticism' | null;
  userSolution: UserSolution | null;
  onComplete: () => void;
}

interface ProcessedResponse {
  index: number;
  title: string;
  description: string;
  response: ItemResponseType;
  reasoning: string;
  modification: string;
  originalText: string;
}

export function AIResponseModal({
  visible,
  onCancel,
  responseData,
  interactionType,
  userSolution,
  onComplete,
}: AIResponseModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [processing, setProcessing] = useState(false);
  const [responses, setResponses] = useState<ProcessedResponse[]>([]);
  const [integratedText, setIntegratedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [integrationStep, setIntegrationStep] = useState<
    'responding' | 'integration' | 'confirmation'
  >('responding');
  const [integrationData, setIntegrationData] =
    useState<IntegrationResponse | null>(null);

  const llmService = new LlmApiService();

  // Инициализация ответов при открытии модального окна
  useEffect(() => {
    if (visible && responseData && userSolution) {
      const items = getItemsFromResponse();
      const initialResponses = items.map((item, index) => ({
        index,
        title: getItemTitle(item, index),
        description: getItemDescription(item),
        response: 'accepted' as ItemResponseType,
        reasoning: '',
        modification: '',
        originalText: getItemDescription(item),
      }));
      setResponses(initialResponses);
      setOriginalText(userSolution.currentVersion.content);
      setIntegratedText(userSolution.currentVersion.content);
      setIntegrationStep('responding');
    }
  }, [visible, responseData, userSolution]);

  const getItemsFromResponse = () => {
    if (!responseData) return [];

    if ('ideas' in responseData) {
      return responseData.ideas;
    } else if ('suggestions' in responseData) {
      return responseData.suggestions;
    } else if ('criticisms' in responseData) {
      return responseData.criticisms;
    }
    return [];
  };

  const getItemTitle = (item: any, index: number) => {
    if ('idea_description' in item) {
      return `Идея ${index + 1}`;
    } else if ('target_element' in item) {
      return `Улучшение ${index + 1}: ${item.target_element}`;
    } else if ('criticism_text' in item) {
      return `Критика ${index + 1}`;
    }
    return `Элемент ${index + 1}`;
  };

  const getItemDescription = (item: any) => {
    if ('idea_description' in item) {
      return item.idea_description;
    } else if ('improvement_description' in item) {
      return item.improvement_description;
    } else if ('criticism_text' in item) {
      return item.criticism_text;
    }
    return '';
  };

  const getItemDetails = (item: any) => {
    const details: { label: string; value: string }[] = [];

    if ('potential_impact' in item && item.potential_impact) {
      details.push({
        label: 'Потенциальный эффект',
        value: item.potential_impact,
      });
    }

    if ('integration_advice' in item && item.integration_advice) {
      details.push({
        label: 'Совет по интеграции',
        value: item.integration_advice,
      });
    }

    if ('severity' in item && item.severity) {
      details.push({ label: 'Критичность', value: item.severity });
    }

    if ('suggested_fix' in item && item.suggested_fix) {
      details.push({
        label: 'Предлагаемое исправление',
        value: item.suggested_fix,
      });
    }

    if ('reasoning' in item && item.reasoning) {
      details.push({ label: 'Обоснование', value: item.reasoning });
    }

    if ('source_examples' in item && item.source_examples?.length > 0) {
      details.push({
        label: 'Примеры из решений',
        value: item.source_examples.join(', '),
      });
    }

    return details;
  };

  const handleResponseChange = (index: number, response: ItemResponseType) => {
    setResponses((prev) =>
      prev.map((item, i) => (i === index ? { ...item, response } : item))
    );
  };

  const handleReasoningChange = (index: number, reasoning: string) => {
    setResponses((prev) =>
      prev.map((item, i) => (i === index ? { ...item, reasoning } : item))
    );
  };

  const handleModificationChange = (index: number, modification: string) => {
    setResponses((prev) =>
      prev.map((item, i) => (i === index ? { ...item, modification } : item))
    );
  };

  const canProceed = () => {
    return responses.every((item) => {
      if (item.response === 'rejected') {
        return true; // Отклоненные не требуют дополнительных данных
      }
      if (item.response === 'modified') {
        return item.modification.trim().length > 0;
      }
      return true;
    });
  };

  const handleSubmitResponses = async () => {
    if (!canProceed()) {
      messageApi.warning('Заполните все необходимые поля');
      return;
    }

    setProcessing(true);

    try {
      // Подготавливаем ответы для отправки
      const itemResponses: ItemResponse[] = responses.map((item) => ({
        item_index: item.index,
        response: item.response,
        reasoning: item.reasoning || undefined,
        modification:
          item.response === 'modified' ? item.modification : undefined,
        original_text: item.originalText,
      }));

      // Сохраняем ответы пользователя
      if (responseData && userSolution) {
        await llmService.interactionUserResponse(responseData.interaction_id, {
          interaction_id: responseData.interaction_id,
          item_responses: itemResponses,
        });
      }

      // Проверяем, есть ли принятые элементы
      const acceptedItems = responses.filter(
        (item) => item.response === 'accepted' || item.response === 'modified'
      );

      if (acceptedItems.length > 0) {
        // Интегрируем изменения
        const integrationRequest = {
          solution_id: userSolution!.solution.id!,
          interaction_id: responseData!.interaction_id,
          accepted_items: acceptedItems.map((item) => {
            const originalItem = getItemsFromResponse()[item.index];
            return item.response === 'modified'
              ? { ...originalItem, modified_text: item.modification }
              : originalItem;
          }),
          user_modifications: acceptedItems
            .filter((item) => item.response === 'modified')
            .map((item) => item.modification),
        };

        const integration =
          await llmService.integrationToSolution(integrationRequest);

        setIntegrationData(integration.data);
        setIntegratedText(integration.data.integrated_text);
        setIntegrationStep('integration');
      } else {
        // Нет принятых элементов, просто завершаем
        messageApi.success('Ответы сохранены');
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting responses:', error);
      messageApi.error('Ошибка при сохранении ответов');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmIntegration = async () => {
    if (!integrationData || !userSolution) return;

    setProcessing(true);

    try {
      // Создаем новую версию решения
      await llmService.createSolutionVersion({
        solution_id: userSolution.solution.id!,
        new_content: integratedText,
        change_description: integrationData.change_description,
        influenced_by_interactions: [responseData!.interaction_id],
      });

      messageApi.success('Новая версия решения создана');
      onComplete();
    } catch (error) {
      console.error('Error creating new version:', error);
      messageApi.error('Ошибка при создании новой версии');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectIntegration = async () => {
    try {
      // TODO: Вызвать метод для удаления данных интеграции
      messageApi.info('Изменения отклонены');
      onComplete();
    } catch (error) {
      console.error('Error rejecting integration:', error);
      messageApi.error('Ошибка при отклонении изменений');
    }
  };

  const getModalTitle = () => {
    switch (interactionType) {
      case 'ideas':
        return 'Новые идеи от КИ';
      case 'improvements':
        return 'Предложения по улучшению';
      case 'criticism':
        return 'Конструктивная критика';
      default:
        return 'Ответ ИИ';
    }
  };

  const getModalIcon = () => {
    switch (interactionType) {
      case 'ideas':
        return <BulbOutlined />;
      case 'improvements':
        return <ThunderboltOutlined />;
      case 'criticism':
        return <ExclamationCircleOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const acceptedCount = responses.filter(
    (r) => r.response === 'accepted'
  ).length;
  const modifiedCount = responses.filter(
    (r) => r.response === 'modified'
  ).length;
  const rejectedCount = responses.filter(
    (r) => r.response === 'rejected'
  ).length;

  const items = getItemsFromResponse();

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      className="ai-response-modal"
      destroyOnClose
      maskClosable={false}
    >
      <div className="modal-content">
        {contextHolder}

        {/* Заголовок */}
        <div className="modal-header">
          <div className="modal-icon">{getModalIcon()}</div>
          <h2>{getModalTitle()}</h2>
          <p>
            {integrationStep === 'responding' &&
              'Рассмотрите каждое предложение и выберите действие'}
            {integrationStep === 'integration' &&
              'Проверьте интегрированные изменения'}
            {integrationStep === 'confirmation' &&
              'Подтвердите создание новой версии'}
          </p>
        </div>

        {/* Основной контент */}
        <div className="modal-body">
          {integrationStep === 'responding' && (
            <>
              {/* Статистика ответов */}
              <div className="response-stats">
                <Badge count={acceptedCount} color="#52c41a">
                  <span>Принято</span>
                </Badge>
                <Badge count={modifiedCount} color="#fa8c16">
                  <span>Изменено</span>
                </Badge>
                <Badge count={rejectedCount} color="#f5222d">
                  <span>Отклонено</span>
                </Badge>
              </div>

              {/* Список элементов для обработки */}
              <div className="responses-list">
                {items.map((item, index) => {
                  const response = responses[index];
                  if (!response) return null;

                  return (
                    <Card key={index} className="response-item">
                      <div className="response-header">
                        <h4>{response.title}</h4>
                        <div className="response-actions">
                          <Radio.Group
                            value={response.response}
                            onChange={(e) =>
                              handleResponseChange(index, e.target.value)
                            }
                            size="small"
                          >
                            <Radio.Button value="accepted">
                              <CheckOutlined /> Принять
                            </Radio.Button>
                            <Radio.Button value="modified">
                              <EditOutlined /> Изменить
                            </Radio.Button>
                            <Radio.Button value="rejected">
                              <CloseOutlined /> Отклонить
                            </Radio.Button>
                          </Radio.Group>
                        </div>
                      </div>

                      <div className="response-content">
                        <div className="item-description">
                          {response.description}
                        </div>

                        {/* Дополнительные детали */}
                        {getItemDetails(item).length > 0 && (
                          <div className="item-details">
                            {getItemDetails(item).map((detail, idx) => (
                              <div key={idx} className="detail-item">
                                <strong>{detail.label}:</strong> {detail.value}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Поле для изменений */}
                        {response.response === 'modified' && (
                          <div className="modification-section">
                            <label>Ваша версия:</label>
                            <TextArea
                              value={response.modification}
                              onChange={(e) =>
                                handleModificationChange(index, e.target.value)
                              }
                              placeholder="Введите вашу версию предложения..."
                              rows={3}
                              maxLength={1000}
                            />
                          </div>
                        )}

                        {/* Поле для обоснования отклонения */}
                        {response.response === 'rejected' && (
                          <div className="reasoning-section">
                            <label>Причина отклонения (опционально):</label>
                            <TextArea
                              value={response.reasoning}
                              onChange={(e) =>
                                handleReasoningChange(index, e.target.value)
                              }
                              placeholder="Объясните, почему отклоняете это предложение..."
                              rows={2}
                              maxLength={500}
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {integrationStep === 'integration' && (
            <div className="integration-preview">
              <Tabs
                defaultActiveKey="preview"
                items={[
                  {
                    key: 'preview',
                    label: (
                      <span>
                        <EyeOutlined />
                        Предварительный просмотр
                      </span>
                    ),
                    children: (
                      <div className="preview-content">
                        <div className="integrated-text">
                          <h4>Новая версия решения:</h4>
                          <div className="text-content">{integratedText}</div>
                        </div>

                        {integrationData && (
                          <div className="change-description">
                            <h4>Описание изменений:</h4>
                            <p>{integrationData.change_description}</p>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'diff',
                    label: (
                      <span>
                        <FileTextOutlined />
                        Сравнение версий
                      </span>
                    ),
                    children: (
                      <div className="diff-content">
                        <ReactDiffViewer
                          oldValue={originalText}
                          newValue={integratedText}
                          splitView={window.innerWidth > 768}
                          leftTitle="Текущая версия"
                          rightTitle="Новая версия"
                          showDiffOnly={false}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>

        {/* Действия */}
        <div className="modal-actions">
          {integrationStep === 'responding' && (
            <>
              <Button type="default" onClick={onCancel} size="large">
                Отмена
              </Button>
              <Button
                type="primary"
                onClick={handleSubmitResponses}
                disabled={!canProceed()}
                loading={processing}
                size="large"
                icon={<SendOutlined />}
              >
                Отправить ответы ({acceptedCount + modifiedCount} принято)
              </Button>
            </>
          )}

          {integrationStep === 'integration' && (
            <>
              <Button
                type="default"
                onClick={handleRejectIntegration}
                size="large"
                icon={<CloseOutlined />}
              >
                Отклонить изменения
              </Button>
              <Button
                type="primary"
                onClick={handleConfirmIntegration}
                loading={processing}
                size="large"
                icon={<CheckOutlined />}
              >
                Подтвердить и создать версию
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
