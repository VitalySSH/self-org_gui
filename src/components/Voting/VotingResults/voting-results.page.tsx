import './voting-results.page.scss';
import { Progress } from 'antd';
import { VotingResultsProps } from 'src/interfaces';

export function VotingResults(props: VotingResultsProps) {
  return (
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
  );
}
