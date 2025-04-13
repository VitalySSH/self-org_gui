import { Modal, Spin } from 'antd';
import { useEffect, useState } from 'react';

interface ResponsibilityCheckModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  checkDuration?: number;
}

export function ResponsibilityCheckModal({
  visible,
  onClose,
  onComplete,
  checkDuration = 5000,
}: ResponsibilityCheckModalProps) {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      const timerId = setTimeout(() => {
        onComplete();
        onClose();
      }, checkDuration);
      setTimer(timerId);

      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [visible]);

  return (
    <Modal
      title="Проверка зоны ответственности"
      open={visible}
      closable={false}
      footer={null}
      centered
    >
      <>
        <Spin size="large">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p>
              Выполняется эмитация проверки зоны ответственности в текщем и
              верхнеуровневых сообществах...
            </p>
          </div>
        </Spin>
      </>
    </Modal>
  );
}
