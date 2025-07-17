import './cover-letter.component.scss';
import { DownOutlined, UpOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Button, Typography } from 'antd';

const { Text } = Typography;

interface CoverLetterProps {
  letter: string;
  maxLength?: number;
  showIcon?: boolean;
  size?: 'small' | 'default' | 'large';
}

export function CoverLetter({
  letter,
  maxLength = 150,
  showIcon = true,
  size = 'default'
}: CoverLetterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = letter.length > maxLength;
  const displayText = isExpanded || !shouldTruncate
    ? letter
    : `${letter.substring(0, maxLength)}...`;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`cover-letter cover-letter-${size}`}>
      {showIcon && (
        <div className="letter-header">
          <FileTextOutlined className="letter-icon" />
          <Text type="secondary" className="letter-label">
            Сопроводительное письмо:
          </Text>
        </div>
      )}

      <div className="letter-content">
        <Text
          className={`letter-text ${isExpanded ? 'expanded' : 'collapsed'}`}
        >
          {displayText}
        </Text>
      </div>

      {shouldTruncate && (
        <div className="letter-actions">
          <Button
            type="text"
            size="small"
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={toggleExpand}
            className="expand-button"
          >
            {isExpanded ? 'Свернуть' : 'Показать полностью'}
          </Button>
        </div>
      )}
    </div>
  );
}