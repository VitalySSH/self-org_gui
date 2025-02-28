import './user-voting.page.scss';
import { UserVotingProps } from 'src/interfaces';
import { useState } from 'react';
import { Checkbox } from 'antd';
import { CustomSelect } from 'src/components';
import { CrudDataSourceService } from 'src/services';
import { VotingOptionModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';

export function UserVoting(props: UserVotingProps) {
  const [userVote, setUserVote] = useState<boolean | undefined | null>(
    props.vote
  );

  const votingOptionService = new CrudDataSourceService(VotingOptionModel);

  const getFilters = (): Filters => {
    switch (props.resource) {
      case 'initiative':
        return [
          {
            field: 'initiative_id',
            op: 'equals',
            val: props.initiativeId,
          },
        ];
      case 'rule':
        return [
          {
            field: 'rule_id',
            op: 'equals',
            val: props.ruleId,
          },
        ];
    }
  };

  const handleVote = (vote: boolean) => {
    setUserVote(vote);
    props.onVote(vote);
  };

  const getVotingOptions = async () => {
    const resp = await votingOptionService.list(getFilters());
    return resp.data;
  };

  if (userVote === undefined) {
    return null;
  }

  return (
    <div className="user-voting">
      <h3>Ваш голос:</h3>
      <i className="rule-question">{props.question}</i>
      <div style={{ marginTop: 4 }}>
        <Checkbox
          checked={userVote === true}
          onChange={() => handleVote(true)}
          aria-label="Да"
        >
          Да
        </Checkbox>
        <Checkbox
          checked={userVote === false}
          onChange={() => handleVote(false)}
          aria-label="Нет"
        >
          Нет
        </Checkbox>
      </div>

      {userVote && props.isOptions && (
        <div className="additional-question">
          <i>{props.extraQuestion}</i>
          <CustomSelect
            fieldService={votingOptionService}
            requestOptions={getVotingOptions}
            multiple={props.isMultiSelect}
            label="Выберите дополнительные параметры"
            onChange={props.onSelectChange}
            value={props.options}
            formField="voting_options"
            bindLabel="content"
            addOwnValue={true}
            ownValuePlaceholder="Введите свой вариант"
            ownValueMaxLength={140}
          />
        </div>
      )}
    </div>
  );
}
