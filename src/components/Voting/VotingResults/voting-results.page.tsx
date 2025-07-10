import './voting-results.page.scss';
import { Button, Form, Progress, Select, Tooltip, Space, Flex } from 'antd';
import { VotingResultsProps } from 'src/interfaces';
import {
  InfoCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { AiCompromise } from 'src/components';

export function VotingResults(props: VotingResultsProps) {
  const [isAIModalVisible, setAIModalVisible] = useState(false);

  const handleCompromise = () => {
    setAIModalVisible(true);
  };

  return (
    <>
      <div className="voting-results">
        <Progress
          percent={props.yesPercent}
          status="active"
          format={() => `Да: ${props.yesPercent}%`}
        />
        <Progress
          percent={props.noPercent}
          status="active"
          format={() => `Нет: ${props.noPercent}%`}
        />
        <Progress
          percent={props.abstainPercent}
          status="active"
          format={() => `Воздержалось: ${props.abstainPercent}%`}
        />
      </div>

      {props.extraQuestion && (props.selectedOptions || []).length > 0 && (
        <div>
          <i className="extra-question">{props.extraQuestion}</i>
          <Form.Item>
            <Select
              mode="multiple"
              value={props.selectedOptions}
              suffixIcon={null}
              open={false}
              removeIcon={null}
            />
          </Form.Item>
        </div>
      )}

      {props.resource === 'rule' && (props.noncompliance || []).length > 0 && (
        <div>
          <p className="extra-question">Последствия несоблюдения правила:</p>
          <Form.Item>
            <Select
              mode="multiple"
              value={props.noncompliance}
              suffixIcon={null}
              open={false}
              removeIcon={null}
            />
          </Form.Item>
        </div>
      )}

      {((props.minorityOptions || []).length > 0 ||
        (props.minorityNoncompliance || []).length > 0) && (
        <div className="minority-section">
          <Flex
            justify="space-between"
            align="center"
            className="minority-header"
          >
            <Space size={8} align="center">
              <Tooltip title="Эти варианты набрали значительное количество голосов и требуют поиска копромисса, учитывающего мнения общественно-значемого меньшинства">
                <InfoCircleOutlined className="icon" />
              </Tooltip>
              <span className="minority-text">Важные мнения меньшинства</span>
            </Space>
            <Button
              type="primary"
              icon={<RobotOutlined style={{ color: 'white' }} />}
              onClick={handleCompromise}
              className="ai-button-primary"
            >
              ИИ поиск компромиссов
            </Button>
          </Flex>

          <div className="minority-form_field">
            {(props.minorityOptions || []).length > 0 && (
              <Form.Item label="Варианты голосования">
                <Select
                  mode="multiple"
                  value={props.minorityOptions}
                  suffixIcon={null}
                  open={false}
                  removeIcon={null}
                />
              </Form.Item>
            )}
            {props.resource === 'rule' &&
              (props.minorityNoncompliance || []).length > 0 && (
                <Form.Item label="Последствия несоблюдения правила">
                  <Select
                    mode="multiple"
                    value={props.minorityNoncompliance}
                    suffixIcon={null}
                    open={false}
                    removeIcon={null}
                  />
                </Form.Item>
              )}
          </div>
        </div>
      )}

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
