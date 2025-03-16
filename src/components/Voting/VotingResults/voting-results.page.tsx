import './voting-results.page.scss';
import { Form, Progress, Select } from "antd";
import { VotingResultsProps } from 'src/interfaces';
import { InfoCircleOutlined } from '@ant-design/icons';

export function VotingResults(props: VotingResultsProps) {
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
          <i>{props.extraQuestion}</i>
          <Form.Item>
            <Select
              mode="multiple"
              value={props.selectedOptions}
              suffixIcon={null}
              open={false}
              removeIcon={null}
            ></Select>
          </Form.Item>
        </div>
      )}

      {(props.minorityOptions || []).length > 0 && (
        <div>
          <div className="custom-header with-icon">
            <InfoCircleOutlined className="icon" />&nbsp;
            <span>Мнения общественно-значимого меньшинства, которые необходимо учесть при поиске компромиссного решения:</span>
          </div>
          <Form.Item>
            <Select
              mode="multiple"
              value={props.minorityOptions}
              suffixIcon={null}
              open={false}
              removeIcon={null}
            ></Select>
          </Form.Item>
        </div>
      )}
    </>
  );
}
