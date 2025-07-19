import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Avatar, Typography } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  CheckOutlined
} from '@ant-design/icons';
import './ai-opinion-assistant.component.scss';

const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isQuestion?: boolean;
}

interface AIOpinionAssistantProps {
  onComplete: (opinion: string) => void;
  onCancel: () => void;
}

const OPINION_QUESTIONS = [
  {
    question: "Привет! Я помогу тебе сформулировать твоё мнение. Для начала расскажи: что ты думаешь об этом предложении в целом?",
    followUp: "Отлично! Теперь поделись: какие положительные и отрицательные стороны ты видишь в этом предложении?"
  },
  {
    question: "Спасибо за развёрнутый ответ! Как, по твоему мнению, это может повлиять на сообщество? Какие последствия ты предвидишь?",
    followUp: "И последний вопрос: есть ли у тебя альтернативные идеи или предложения по улучшению? Что бы ты изменил или добавил?"
  }
];

export const AIOpinionAssistant: React.FC<AIOpinionAssistantProps> = ({ onComplete, onCancel }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Добавляем первый вопрос при загрузке
    if (messages.length === 0) {
      simulateTyping(OPINION_QUESTIONS[0].question, 1000, true);
    }
  }, []);

  const addMessage = (text: string, isUser: boolean, isQuestion: boolean = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      isQuestion
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (text: string, delay: number = 800, isQuestion: boolean = false) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(text, false, isQuestion);
    }, delay);
  };

  const generateOpinionText = (answers: string[]): string => {
    return answers
      .filter(answer => answer.trim())
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userInput = currentMessage.trim();
    addMessage(userInput, true);

    // Сохраняем ответ пользователя
    const newAnswers = [...userAnswers, userInput];
    setUserAnswers(newAnswers);

    setCurrentMessage('');

    // Определяем следующий шаг
    setTimeout(() => {
      if (currentStep === 0) {
        // После первого ответа задаём второй вопрос
        simulateTyping(OPINION_QUESTIONS[0].followUp, 1000, true);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // После второго ответа задаём третий вопрос
        simulateTyping(OPINION_QUESTIONS[1].question, 1000, true);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // После третьего ответа задаём четвёртый вопрос
        simulateTyping(OPINION_QUESTIONS[1].followUp, 1000, true);
        setCurrentStep(3);
      } else {
        // Завершаем диалог
        simulateTyping(
          "Отлично! Спасибо за подробные ответы. Я сформировал твоё мнение на основе всех ответов. Нажми 'Завершить', чтобы перенести текст в поле для ввода.",
          1200
        );
        setIsComplete(true);
      }
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleComplete = () => {
    const finalOpinion = generateOpinionText(userAnswers);
    onComplete(finalOpinion);
  };

  return (
    <div className="ai-opinion-container">
      <div className="ai-opinion-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onCancel}
          className="ai-opinion-back-button"
        >
          Назад к полю ввода
        </Button>
        <div className="ai-opinion-title">
          <RobotOutlined />
          ИИ-помощник для формирования мнения
        </div>
      </div>

      <div className="ai-opinion-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`ai-message ${message.isUser ? 'ai-message-user' : 'ai-message-ai'}`}
          >
            <div className="ai-message-avatar">
              <Avatar
                icon={
                  message.isUser
                    ? <UserOutlined />
                    : <RobotOutlined />
                }
                style={{
                  backgroundColor: message.isUser
                    ? '#52c41a'
                    : message.isQuestion
                      ? '#fa8c16'
                      : '#1890ff'
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
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="ai-message ai-message-ai">
            <div className="ai-message-avatar">
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
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

      <div className="ai-opinion-input">
        {!isComplete ? (
          <div className="ai-opinion-input-wrapper">
            <TextArea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Поделитесь своими мыслями..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="ai-opinion-textarea"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isTyping}
              className="ai-opinion-send-button"
            >
              Ответить
            </Button>
          </div>
        ) : (
          <div className="ai-opinion-complete">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleComplete}
              size="large"
              className="ai-opinion-complete-button"
            >
              Завершить и перенести мнение
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};