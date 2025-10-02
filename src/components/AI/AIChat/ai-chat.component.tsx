import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Input,
  Card,
  Avatar,
  Typography,
  Space,
  Divider,
  Modal,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { RuleFormInterface, Pagination } from 'src/interfaces';
import { Filters } from 'src/shared/types.ts';
import './ai-chat.component.scss';

const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  onComplete: (data: RuleFormInterface) => void;
  onCancel: () => void;
  fetchCategories: (pagination?: Pagination, filters?: Filters) => Promise<any>;
}

// Исходный компонент без изменений
const AIChatComponent: React.FC<AIChatProps & { isMobile?: boolean }> = ({
  onComplete,
  onCancel,
  fetchCategories,
  isMobile = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я твой ИИ-помощник. Расскажи мне, что ты хочешь предложить сообществу, и я помогу тебе это оформить.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  const [ruleData, setRuleData] = useState<Partial<RuleFormInterface>>({});
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const simulateTyping = (text: string, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(text, false);
    }, delay);
  };

  const mockAIResponses = [
    // Первый ответ после описания правила
    {
      condition: (step: number) => step === 0,
      response: (userInput: string) => {
        // Имитируем обработку пользовательского ввода
        const title =
          userInput.substring(0, 50) + (userInput.length > 50 ? '...' : '');
        setRuleData((prev) => ({
          ...prev,
          title: title,
          content: userInput,
        }));
        return `Отлично! Теперь помоги мне сформулировать вопрос для голосования. Это должен быть закрытый вопрос, на который можно ответить "да" или "нет".`;
      },
    },
    // Второй ответ после вопроса
    {
      condition: (step: number) => step === 1,
      response: (userInput: string) => {
        const question = userInput.endsWith('?') ? userInput : userInput + '?';
        setRuleData((prev) => ({
          ...prev,
          question: question,
        }));
        return `Хорошо! Теперь скажи, нужны ли дополнительные параметры для голосования? Это может быть полезно, если ответ не ограничивается только "да" или "нет".`;
      },
    },
    // Третий ответ
    {
      condition: (step: number) => step === 2,
      response: (userInput: string) => {
        const needsExtra =
          userInput.toLowerCase().includes('да') ||
          userInput.toLowerCase().includes('нужн') ||
          userInput.toLowerCase().includes('необходим');

        setRuleData((prev) => ({
          ...prev,
          is_extra_options: needsExtra,
          is_multi_select: false,
        }));

        if (needsExtra) {
          return `Понятно! Какой дополнительный вопрос стоит задать участникам голосования?`;
        } else {
          return `Отлично! Все данные собраны. Теперь я подготовлю форму с вашими данными. Нажмите "Подтвердить", чтобы продолжить.`;
        }
      },
    },
    // Четвертый ответ (если нужны дополнительные параметры)
    {
      condition: (step: number) => step === 3,
      response: (userInput: string) => {
        const extraQuestion = userInput.endsWith('?')
          ? userInput
          : userInput + '?';
        setRuleData((prev) => ({
          ...prev,
          extra_question: extraQuestion,
          extra_options: [
            { name: 'Вариант 1' },
            { name: 'Вариант 2' },
            { name: 'Вариант 3' },
          ],
        }));
        return `Отлично! Все данные собраны. Теперь я подготовлю форму с вашими данными. Нажмите "Подтвердить", чтобы продолжить.`;
      },
    },
  ];

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    addMessage(currentMessage, true);
    const userInput = currentMessage;
    setCurrentMessage('');

    // Находим подходящий ответ
    const responseConfig = mockAIResponses.find((config) =>
      config.condition(conversationStep)
    );

    if (responseConfig) {
      const response = responseConfig.response(userInput);
      simulateTyping(response, 800);
      setConversationStep((prev) => prev + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      // Получаем первую доступную категорию
      const categoriesResponse = await fetchCategories();
      const firstCategory = categoriesResponse?.data?.[0] || {};

      const finalRuleData: RuleFormInterface = {
        title: ruleData.title || 'Новое правило',
        question: ruleData.question || 'Следует ли ввести данное правило?',
        content: ruleData.content || 'Описание правила',
        category: firstCategory,
        is_extra_options: ruleData.is_extra_options || false,
        is_multi_select: ruleData.is_multi_select || false,
        extra_question: ruleData.extra_question || '',
        extra_options: ruleData.extra_options || [],
      };

      setTimeout(() => {
        onComplete(finalRuleData);
        onComplete(finalRuleData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setIsLoading(false);
    }
  };

  const canConfirm =
    conversationStep >= 3 ||
    (conversationStep >= 2 && !ruleData.is_extra_options);

  return (
    <div className={`ai-chat-container ${isMobile ? 'ai-chat-mobile' : ''}`}>
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <RobotOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          ИИ-помощник
        </div>
        <Space>
          <Button
            type="text"
            icon={isMobile ? <CloseOutlined /> : <ArrowLeftOutlined />}
            onClick={onCancel}
            className="ai-chat-back-button"
          >
            {isMobile ? 'Закрыть' : 'Назад к форме'}
          </Button>
        </Space>
      </div>

      <div className="ai-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`ai-message ${message.isUser ? 'ai-message-user' : 'ai-message-ai'}`}
          >
            <div className="ai-message-avatar">
              <Avatar
                icon={message.isUser ? <UserOutlined /> : <RobotOutlined />}
                style={{
                  backgroundColor: message.isUser ? '#87d068' : '#1890ff',
                }}
              />
            </div>
            <div className="ai-message-content">
              <Card
                size="small"
                className={`ai-message-card ${message.isUser ? 'ai-message-card-user' : 'ai-message-card-ai'}`}
              >
                <Text>{message.text}</Text>
              </Card>
              <div className="ai-message-time">
                {message.timestamp.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="ai-message ai-message-ai">
            <div className="ai-message-avatar">
              <Avatar
                icon={<RobotOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
            </div>
            <div className="ai-message-content">
              <Card size="small" className="ai-message-card ai-message-card-ai">
                <div className="ai-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input">
        <div className="ai-chat-input-wrapper">
          <TextArea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите ваше сообщение..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="ai-chat-textarea"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isTyping}
            className="ai-chat-send-button"
          >
            Отправить
          </Button>
        </div>

        {canConfirm && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div className="ai-chat-confirm">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleConfirm}
                loading={isLoading}
                size="large"
                className="ai-chat-confirm-button"
              >
                Подтвердить и заполнить форму
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Главный компонент с простым условием
export const AIChat: React.FC<AIChatProps> = ({
  onComplete,
  onCancel,
  fetchCategories,
}) => {
  // Простое определение мобильного устройства при загрузке
  const isMobile = window.innerWidth <= 768;

  // Для мобильных - модальное окно, для десктопа - обычный компонент
  if (isMobile) {
    return (
      <Modal
        open={true}
        onCancel={onCancel}
        footer={null}
        width="100%"
        style={{
          top: 0,
          padding: 0,
          maxWidth: '100vw',
        }}
        bodyStyle={{
          padding: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
        className="ai-chat-modal"
        closable={false}
        destroyOnHidden
      >
        <AIChatComponent
          onComplete={onComplete}
          onCancel={onCancel}
          fetchCategories={fetchCategories}
          isMobile={true}
        />
      </Modal>
    );
  }

  // Десктопная версия - без изменений
  return (
    <AIChatComponent
      onComplete={onComplete}
      onCancel={onCancel}
      fetchCategories={fetchCategories}
      isMobile={false}
    />
  );
};
