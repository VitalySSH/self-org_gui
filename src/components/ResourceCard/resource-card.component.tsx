import styles from './resource-card.module.scss';
import { useNavigate } from 'react-router-dom';
import { Card, Flex } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { StatusTag } from 'src/components/StatusTag/status-tag.component.tsx';
import { OneDayEventLabel } from 'src/consts';

const { Meta } = Card;

export function ResourceCard(props: any) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState<boolean | null>(
    null
  );

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldShowExpandButton = useCallback(() => {
    if (showExpandButton === null) {
      if (props.item.description) {
        const shouldShowExpandButton = props.item.description.length > 300;
        setShowExpandButton(shouldShowExpandButton);
      }
    }
  }, [props.item.description]);

  useEffect(() => {
    shouldShowExpandButton();
  }, [shouldShowExpandButton]);

  return (
    <Card
      onClick={() => navigate(props.item.id)}
      className={styles.initiativeCard}
    >
      <Meta title={props.item.title} description={null} />
      <div
        className={`${styles.description} ${isExpanded ? styles.expanded : styles.collapsed}`}
      >
        {props.item.description}
      </div>
      {showExpandButton && (
        <div
          className={styles.expandButton}
          onClick={(e) => {
            e.stopPropagation(); // Останавливаем всплытие события
            toggleExpand();
          }}
        >
          {isExpanded ? 'Свернуть описание' : 'Раскрыть описание'}
        </div>
      )}
      <div style={{ fontSize: 14 }}>
        <div style={{ marginTop: 10 }}>
          <strong>Автор:</strong> {props.item.creator}
        </div>
        <div style={{ marginTop: 10 }}>
          <strong>Категория:</strong> {props.item.category}
        </div>
        <div style={{ marginTop: 10 }}>
          <Flex align="center" gap={8}>
            <strong>Статус:</strong>
            <StatusTag
              status={props.item.status || ''}
              statusCode={props.item.statusCode || ''}
            />
          </Flex>
        </div>
        {props.item.isOneDayEvent && (
          <>
            <div style={{ marginTop: 10 }}>
              <strong>Тип:</strong> {OneDayEventLabel}
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>Дата события:</strong> {props.item.eventDate}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
