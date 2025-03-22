import { Modal, Spin, Typography, Button, Space, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import {
  CopyOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { AiSummaryProps } from 'src/interfaces';
import './ai-summary-modal.component.scss';

const { Text } = Typography;
const { TextArea } = Input;

export function AISummaryModal(props: AiSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14); // Размер шрифта

  useEffect(() => {
    if (props.visible) {
      setLoading(true);
      // Mock
      fetchAISummary()
        .then((result) => {
          setSummary(result);
        })
        .catch((error) => {
          console.error('Ошибка при получении AI-суммирования:', error);
          setSummary('Не удалось получить суммирование мнений.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [props.visible]);

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  // Копирование текста в буфер обмена
  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary).then(() => {
      message.success('Текст скопирован в буфер обмена').then();
    });
  };

  return (
    <Modal
      title="Сумма мнений участников голования"
      open={props.visible}
      onCancel={props.onClose}
      footer={null}
      width="60%"
      className="ai-summary-modal"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin size="large" />
          <Text style={{ marginTop: 16, display: 'block' }}>
            Идёт обработка мнений...
          </Text>
        </div>
      ) : (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button icon={<CopyOutlined />} onClick={copyToClipboard}>
              Копировать
            </Button>
            <Button icon={<ZoomInOutlined />} onClick={increaseFontSize} />
            <Button icon={<ZoomOutOutlined />} onClick={decreaseFontSize} />
          </Space>

          <TextArea
            value={summary}
            readOnly
            autoSize={{ minRows: 10, maxRows: 20 }}
            style={{
              width: '100%',
              fontSize: `${fontSize}px`,
              overflowY: 'auto',
              resize: 'none',
            }}
          />
        </>
      )}
    </Modal>
  );
}

// Заглушка для вызова API
async function fetchAISummary(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        'Здесь будет отображаться ответ LLM, которая обобщит мнения участников голосования, предоставит статистические данные и ответит на любые вопросы, как если бы они были заданы коллективному разуму всех членов сообшества.'
      );
    }, 2000); // Имитация задержки запроса
  });
}
