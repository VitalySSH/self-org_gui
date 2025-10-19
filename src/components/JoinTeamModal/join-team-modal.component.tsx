import { Modal, Typography, Button, Space, Divider } from 'antd';
import {
  TeamOutlined,
  MailOutlined,
  SendOutlined,
  RocketOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import './join-team-modal.component.scss';

const { Title, Paragraph, Text } = Typography;

interface JoinTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export function JoinTeamModal({ open, onClose }: JoinTeamModalProps) {
  const handleEmailClick = () => {
    window.location.href = 'mailto:utu.app.team@gmail.com';
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/UtU_dev_bot', '_blank');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className="join-team-modal"
      centered
    >
      <div className="join-team-content">
        {/* Header */}
        <div className="join-team-header">
          <div className="header-icon">
            <RocketOutlined />
          </div>
          <Title level={2} className="header-title">
            Присоединяйтесь к команде
          </Title>
          <Paragraph className="header-subtitle">
            <strong>Up to You (UtU)</strong> — платформа, где{' '}
            <strong>Тебе решать</strong>, как мы вместе создаём будущее
            коллективного интеллекта
          </Paragraph>
        </div>

        <Divider />

        {/* Mission */}
        <div className="join-team-mission">
          <div className="mission-icon">
            <HeartOutlined />
          </div>
          <Paragraph className="mission-text">
            Мы создаём экспериментальную платформу для раскрытия потенциала
            коллективного разума. Каждый участник команды влияет на развитие
            проекта и помогает группам людей эффективно сотрудничать.
          </Paragraph>
        </div>

        <Divider />

        {/* Contact Methods */}
        <div className="join-team-contacts">
          <Title level={4} className="contacts-title">
            <TeamOutlined /> Как присоединиться
          </Title>

          <Space direction="vertical" size="large" className="contact-methods">
            {/* Telegram */}
            <div className="contact-method">
              <div className="method-header">
                <SendOutlined className="method-icon telegram-icon" />
                <Text strong className="method-title">
                  Telegram бот (рекомендуем)
                </Text>
              </div>
              <Paragraph className="method-description">
                Быстрый способ связаться с командой и узнать актуальные задачи
              </Paragraph>
              <div className="method-action">
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  onClick={handleTelegramClick}
                  className="telegram-button"
                  block
                >
                  Открыть @UtU_dev_bot
                </Button>
                <Text type="secondary" className="method-hint">
                  Выполните команду <code>/join</code> в боте
                </Text>
              </div>
            </div>

            {/* Email */}
            <div className="contact-method">
              <div className="method-header">
                <MailOutlined className="method-icon email-icon" />
                <Text strong className="method-title">
                  Email
                </Text>
              </div>
              <Paragraph className="method-description">
                Напишите нам о своих навыках и интересе к проекту
              </Paragraph>
              <div className="method-action">
                <Button
                  size="large"
                  icon={<MailOutlined />}
                  onClick={handleEmailClick}
                  className="email-button"
                  block
                >
                  utu.app.team@gmail.com
                </Button>
              </div>
            </div>
          </Space>
        </div>

        <Divider />

        {/* Footer */}
        <div className="join-team-footer">
          <Paragraph className="footer-text">
            <TeamOutlined /> Мы ищем разработчиков, дизайнеров, исследователей и
            всех, кому интересны технологии коллективного принятия решений
          </Paragraph>
        </div>
      </div>
    </Modal>
  );
}
