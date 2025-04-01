import './cover-letter.component.scss';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useState } from 'react';

export function CoverLetter(props: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_REASON_LENGTH = 100;

  if (!props.letter) return null;

  const shouldTruncate = props.letter.length > MAX_REASON_LENGTH;
  const displayText =
    isExpanded || !shouldTruncate
      ? props.letter
      : `${props.letter.substring(0, MAX_REASON_LENGTH)}...`;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="letter-container">
      <div className="letter-content">
        <strong>Сопроводительное письмо:</strong>
        <span
          className={`letter-text ${isExpanded ? 'expanded' : 'collapsed'}`}
        >
          {displayText}
        </span>
      </div>
      {shouldTruncate && (
        <div className="expand-button" onClick={toggleExpand}>
          {isExpanded ? (
            <>
              <UpOutlined /> Свернуть текст
            </>
          ) : (
            <>
              <DownOutlined /> Раскрыть текст
            </>
          )}
        </div>
      )}
    </div>
  );
}
