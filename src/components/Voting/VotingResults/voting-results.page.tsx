import { useState } from 'react';
import { Button, Form, Progress, Select, Tooltip } from 'antd';
import {
  InfoCircleOutlined,
  RobotOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { VotingResultsProps } from 'src/interfaces';
import { AiCompromise } from 'src/components';
import './voting-results.page.scss';

export function VotingResults(props: VotingResultsProps) {
  const [isAIModalVisible, setAIModalVisible] = useState(false);

  const handleCompromise = () => {
    setAIModalVisible(true);
  };

  return (
    <>
      {/* Основные результаты голосования */}
      <div className="voting-results">
        <div className="results-title">
          <BarChartOutlined />
          Результаты голосования
        </div>

        <div className="voting-progress">
          <div className="progress-item">
            <div className="progress-header">
              <div className="progress-label yes-label">
                <div className="progress-icon"></div>
                Да
              </div>
              <div className="progress-percentage">{props.yesPercent}%</div>
            </div>
            <Progress
              percent={100}
              status="active"
              showInfo={false}
              className="yes-progress"
              size={['', 8]}
              style={{
                width: `${props.yesPercent}%`,
                minWidth: '2%',
                transition: 'width 0.8s ease'
              }}
            />
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <div className="progress-label no-label">
                <div className="progress-icon"></div>
                Нет
              </div>
              <div className="progress-percentage">{props.noPercent}%</div>
            </div>
            <Progress
              percent={100}
              status="active"
              showInfo={false}
              className="no-progress"
              size={['', 8]}
              style={{
                width: `${props.noPercent}%`,
                minWidth: '2%',
                transition: 'width 0.8s ease'
              }}
            />
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <div className="progress-label abstain-label">
                <div className="progress-icon"></div>
                Воздержалось
              </div>
              <div className="progress-percentage">{props.abstainPercent}%</div>
            </div>
            <Progress
              percent={100}
              status="active"
              showInfo={false}
              className="abstain-progress"
              size={['', 8]}
              style={{
                width: `${props.abstainPercent}%`,
                minWidth: '2%',
                transition: 'width 0.8s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Дополнительный вопрос */}
      {props.extraQuestion && (props.selectedOptions || []).length > 0 && (
        <div className="extra-question-section">
          <div className="extra-question-title">
            <QuestionCircleOutlined />
            Дополнительные параметры
          </div>
          <div className="extra-question-text">
            {props.extraQuestion}
          </div>
          <Form.Item>
            <Select
              mode="multiple"
              value={props.selectedOptions}
              suffixIcon={null}
              open={false}
              removeIcon={null}
              placeholder="Выбранные варианты"
            />
          </Form.Item>
        </div>
      )}

      {/* Последствия несоблюдения правила */}
      {props.resource === 'rule' && (props.noncompliance || []).length > 0 && (
        <div className="extra-question-section">
          <div className="extra-question-title">
            <ExclamationCircleOutlined />
            Последствия несоблюдения
          </div>
          <div className="extra-question-text">
            Последствия несоблюдения правила:
          </div>
          <Form.Item>
            <Select
              mode="multiple"
              value={props.noncompliance}
              suffixIcon={null}
              open={false}
              removeIcon={null}
              placeholder="Установленные последствия"
            />
          </Form.Item>
        </div>
      )}

      {/* Секция мнения меньшинства */}
      {((props.minorityOptions || []).length > 0 ||
        (props.minorityNoncompliance || []).length > 0) && (
        <div className="minority-section">
          <div className="minority-header">
            <div className="minority-info">
              <Tooltip title="Эти варианты набрали значительное количество голосов и требуют поиска компромисса, учитывающего мнения общественно-значимого меньшинства">
                <InfoCircleOutlined className="minority-icon" />
              </Tooltip>
              <span className="minority-text">Важные мнения меньшинства</span>
            </div>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleCompromise}
              className="ai-compromise-button"
            >
              ИИ поиск компромиссов
            </Button>
          </div>

          <div className="minority-content">
            {(props.minorityOptions || []).length > 0 && (
              <div className="minority-form-field">
                <Form.Item label="Варианты голосования">
                  <Select
                    mode="multiple"
                    value={props.minorityOptions}
                    suffixIcon={null}
                    open={false}
                    removeIcon={null}
                    placeholder="Альтернативные варианты"
                  />
                </Form.Item>
              </div>
            )}

            {props.resource === 'rule' &&
              (props.minorityNoncompliance || []).length > 0 && (
                <div className="minority-form-field">
                  <Form.Item label="Последствия несоблюдения правила">
                    <Select
                      mode="multiple"
                      value={props.minorityNoncompliance}
                      suffixIcon={null}
                      open={false}
                      removeIcon={null}
                      placeholder="Альтернативные последствия"
                    />
                  </Form.Item>
                </div>
              )}
          </div>
        </div>
      )}

      {/* AI модальное окно */}
      <AiCompromise
        visible={isAIModalVisible}
        onClose={() => setAIModalVisible(false)}
        resource={props.resource}
        ruleId={props.ruleId}
        initiativeId={props.initiativeId}
      />
    </>
  );
}