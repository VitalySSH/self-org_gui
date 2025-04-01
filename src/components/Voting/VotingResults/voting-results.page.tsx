import './voting-results.page.scss';
import { Button, Form, Progress, Select, Tooltip, Space, Flex } from 'antd';
import { VotingResultsProps } from 'src/interfaces';
import { InfoCircleOutlined, BulbOutlined } from '@ant-design/icons';
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

      {(props.minorityOptions || []).length > 0 && (
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
              icon={<BulbOutlined style={{ color: 'white' }} />}
              onClick={handleCompromise}
            >
              AI поиск компромиссов
            </Button>
          </Flex>
          <Form.Item>
            <Select
              mode="multiple"
              value={props.minorityOptions}
              suffixIcon={null}
              open={false}
              removeIcon={null}
            />
          </Form.Item>
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
