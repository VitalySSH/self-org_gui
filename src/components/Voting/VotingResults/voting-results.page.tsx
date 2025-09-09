import { useState } from 'react';
import { Button, Progress, Tooltip } from 'antd';
import {
  InfoCircleOutlined,
  RobotOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { VotingResultsProps, VotingOptionData } from 'src/interfaces';
import { AiCompromise } from 'src/components';
import './voting-results.page.scss';

export function VotingResults(props: VotingResultsProps) {
  const [isAIModalVisible, setAIModalVisible] = useState(false);

  const handleCompromise = () => {
    setAIModalVisible(true);
  };

  // Функция для сортировки и обработки опций голосования
  const processVotingOptions = (
    data: VotingOptionData | {} | undefined
  ): VotingOptionData[] => {
    if (!data) return [];
    return Object.values(data).sort((a, b) => a.number - b.number);
  };

  // Проверка существования данных
  const hasData = (data: VotingOptionData | {} | undefined): boolean => {
    if (!data) return false;
    return Object.keys(data).length > 0;
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
                transition: 'width 0.8s ease',
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
                transition: 'width 0.8s ease',
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
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Результаты дополнительного вопроса */}
      {props.extraQuestion && hasData(props.selectedOptions) && (
        <div className="extra-question-section">
          <div className="extra-question-title">
            <QuestionCircleOutlined />
            Результаты уточняющего вопроса
          </div>
          <div className="extra-question-text">{props.extraQuestion}</div>

          <div className="extra-options-results">
            {processVotingOptions(props.selectedOptions).map(
              (option, index) => (
                <div key={index} className="extra-option-item">
                  <div className="option-header">
                    <div className="option-label">
                      <div className="option-number">{option.number}</div>
                      <div className="option-value">{option.value}</div>
                    </div>
                    <div className="option-percentage">{option.percent}%</div>
                  </div>
                  <div className="option-progress-container">
                    <Progress
                      percent={option.percent}
                      status="active"
                      showInfo={false}
                      className="extra-option-progress"
                      size={['', 6]}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Последствия несоблюдения правила */}
      {props.resource === 'rule' && hasData(props.noncompliance) && (
        <div className="noncompliance-section">
          <div className="noncompliance-title">
            <ExclamationCircleOutlined />
            Последствия несоблюдения правила
          </div>
          <div className="noncompliance-text">
            Установленные последствия несоблюдения правила:
          </div>

          <div className="noncompliance-results">
            {processVotingOptions(props.noncompliance).map((option, index) => (
              <div key={index} className="noncompliance-item">
                <div className="option-header">
                  <div className="option-label">
                    <div className="option-number">{option.number}</div>
                    <div className="option-value">{option.value}</div>
                  </div>
                  <div className="option-percentage">{option.percent}%</div>
                </div>
                <div className="option-progress-container">
                  <Progress
                    percent={option.percent}
                    status="active"
                    showInfo={false}
                    className="noncompliance-progress"
                    size={['', 6]}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Секция мнения меньшинства */}
      {(hasData(props.minorityOptions) ||
        hasData(props.minorityNoncompliance)) && (
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
            {/* Варианты общественно-значимого меньшинства */}
            {hasData(props.minorityOptions) && (
              <div className="minority-form-field">
                <div className="minority-field-title">
                  Варианты общественно-значимого меньшинства
                </div>

                <div className="minority-options-results">
                  {processVotingOptions(props.minorityOptions).map(
                    (option, index) => (
                      <div key={index} className="minority-option-item">
                        <div className="option-header">
                          <div className="option-label">
                            <div className="option-number">{option.number}</div>
                            <div className="option-value">{option.value}</div>
                          </div>
                          <div className="option-percentage">
                            {option.percent}%
                          </div>
                        </div>
                        <div className="option-progress-container">
                          <Progress
                            percent={option.percent}
                            status="active"
                            showInfo={false}
                            className="minority-option-progress"
                            size={['', 6]}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Варианты меньшинства последствий несоблюдения */}
            {props.resource === 'rule' &&
              hasData(props.minorityNoncompliance) && (
                <div className="minority-form-field">
                  <div className="minority-field-title">
                    Варианты меньшинства последствий несоблюдения
                  </div>

                  <div className="minority-noncompliance-results">
                    {processVotingOptions(props.minorityNoncompliance).map(
                      (option, index) => (
                        <div
                          key={index}
                          className="minority-noncompliance-item"
                        >
                          <div className="option-header">
                            <div className="option-label">
                              <div className="option-number">
                                {option.number}
                              </div>
                              <div className="option-value">{option.value}</div>
                            </div>
                            <div className="option-percentage">
                              {option.percent}%
                            </div>
                          </div>
                          <div className="option-progress-container">
                            <Progress
                              percent={option.percent}
                              status="active"
                              showInfo={false}
                              className="minority-noncompliance-progress"
                              size={['', 6]}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
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
