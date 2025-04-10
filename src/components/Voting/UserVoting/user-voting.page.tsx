import './user-voting.page.scss';
import { Pagination, UserVotingProps } from 'src/interfaces';
import { useState } from 'react';
import { Checkbox, Tag } from 'antd';
import { CustomSelect } from 'src/components';
import { CrudDataSourceService } from 'src/services';
import { NoncomplianceModel, VotingOptionModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';

export function UserVoting(props: UserVotingProps) {
  const [userVote, setUserVote] = useState<boolean | undefined | null>(
    props.vote
  );

  const votingOptionService = new CrudDataSourceService(VotingOptionModel);
  const noncomplianceService = new CrudDataSourceService(NoncomplianceModel);

  const getResourceFilters = (optionalFilters?: Filters): Filters => {
    const filters = optionalFilters || [];
    switch (props.resource) {
      case 'initiative':
        filters.push({
          field: 'initiative_id',
          op: 'equals',
          val: props.initiativeId,
        });
        break;
      case 'rule':
        filters.push({
          field: 'rule_id',
          op: 'equals',
          val: props.ruleId,
        });
        break;
    }
    return filters;
  };

  const getNoncomplianceFilters = (optionalFilters?: Filters): Filters => {
    const filters = optionalFilters || [];
    filters.push({
      field: 'community_id',
      op: 'equals',
      val: props.communityId,
    });

    return filters;
  };

  const handleVote = (vote: boolean) => {
    setUserVote(vote);
    props.onVote(vote);
  };

  const getVotingOptions = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    return votingOptionService.list(
      getResourceFilters(filters), undefined, pagination
    );
  };

  const getNoncompliance = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    return noncomplianceService.list(
      getNoncomplianceFilters(filters), undefined, pagination
    );
  };

  return (
    <div className="user-voting">
      <div className="voting-header">
        <h3>Ваш голос:</h3>
        {props.isDelegateVote && (
          <Tag className="delegate-tag" color="default">
            Голос советника
          </Tag>
        )}
      </div>
      <i className="question">{props.question}</i>
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
            multiple={true}
            enableSearch={true}
            label="Выберите любые понравившиеся варианты"
            onChange={props.onSelectChange}
            value={props.options}
            formField="options"
            bindLabel="content"
            addOwnValue={true}
            ownValuePlaceholder="Введите свой вариант"
            ownValueMaxLength={140}
          />
        </div>
      )}

      {props.resource === 'rule' && (
        <div className="additional-question">
          <p>Последствия несоблюдения правила</p>
          <CustomSelect
            fieldService={noncomplianceService}
            requestOptions={getNoncompliance}
            multiple={true}
            enableSearch={true}
            label="Выберите последствия"
            onChange={props.onSelectChange}
            value={props.noncompliance}
            formField="noncompliance"
            bindLabel="name"
            addOwnValue={true}
            ownValuePlaceholder="Введите свой вариант"
            ownValueMaxLength={140}
          />
        </div>
      )}
    </div>
  );
}
