import { Modal, Spin, Button, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import {
  CopyOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RobotOutlined,
  ExpandOutlined,
  CompressOutlined,
} from '@ant-design/icons';
import { AiModalProps } from 'src/interfaces';
import './ai-modal.component.scss';

const { TextArea } = Input;

export function AIModal(props: AiModalProps) {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (props.visible) {
      setLoading(true);
      props
        .request()
        .then((resp) => {
          let content = '';
          switch (resp.status) {
            case 'OK':
              content = resp.content;
              break;
            case 'NOVOTES':
              content = 'В настоящий момент ещё никто не отдал свой голос.';
              break;
            case 'ERROR':
              content =
                'При выполнении запроса произошла ошибка, попробуйте повторить запрос позднее.';
              break;
          }
          setResponse(content);
        })
        .catch((error) => {
          console.error('Ошибка при получении AI-суммирования:', error);
          setResponse('Не удалось получить суммирование мнений.');
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response).then(() => {
      message.success('Текст скопирован в буфер обмена').then();
    });
  };

  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <RobotOutlined style={{ fontSize: '20px' }} />
      {props.title}
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      open={props.visible}
      onCancel={props.onClose}
      footer={null}
      width={isFullscreen ? '95vw' : undefined}
      style={{
        top: isFullscreen ? 10 : 20,
        maxWidth: isFullscreen ? 'none' : '800px'
      }}
      className="ai-summary-modal ai-modal-fade-in"
      destroyOnClose
      transitionName=""
    >
      {loading ? (
        <div className="ai-modal-loading">
          <Spin size="large" />
          <div className="ai-modal-loading-text">
            Идёт обработка запроса...
          </div>
        </div>
      ) : (
        <>
          <div className="ai-modal-controls">
            <Button
              className="ai-modal-control-button ai-modal-copy-button"
              icon={<CopyOutlined style={{ color: 'white' }} />}
              onClick={copyToClipboard}
            >
              Копировать
            </Button>

            <Button
              className="ai-modal-control-button"
              icon={<ZoomOutOutlined />}
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
            >
              A-
            </Button>

            <Button
              className="ai-modal-control-button"
              icon={<ZoomInOutlined />}
              onClick={increaseFontSize}
              disabled={fontSize >= 24}
            >
              A+
            </Button>

            <Button
              className="ai-modal-control-button"
              icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 'Свернуть' : 'Развернуть'}
            </Button>
          </div>

          <div className="ai-modal-content">
            <TextArea
              value={response}
              readOnly
              autoSize={{
                minRows: isFullscreen ? 25 : 12,
                maxRows: isFullscreen ? 40 : 25
              }}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
              }}
              className="ai-modal-textarea"
              placeholder="Контент будет отображен здесь..."
            />
          </div>
        </>
      )}
    </Modal>
  );
}