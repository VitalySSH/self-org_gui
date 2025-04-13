import './user-voting.page.scss';
import { Pagination, UserVotingProps } from 'src/interfaces';
import { useState } from 'react';
import { Checkbox, Tag, Form, Tooltip, Popover } from 'antd';
import { CustomSelect } from 'src/components';
import { CrudDataSourceService } from 'src/services';
import { NoncomplianceModel, VotingOptionModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import { QuestionCircleOutlined, InfoCircleFilled } from '@ant-design/icons';

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
      getResourceFilters(filters),
      undefined,
      pagination
    );
  };

  const getNoncompliance = async (
    pagination?: Pagination,
    filters?: Filters
  ) => {
    return noncomplianceService.list(
      getNoncomplianceFilters(filters),
      undefined,
      pagination
    );
  };

  const MultipleChoiceHint = () => (
    <Popover
      content={
        <div style={{ maxWidth: 300 }}>
          <p>
            <strong>Как работает множественный выбор?</strong>
          </p>
          <p>
            Вы можете выбрать несколько вариантов. Ваш голос будет автоматически
            распределён между всеми выбранными вариантами:
          </p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li>1 вариант = 100% голоса</li>
            <li>2 варианта = 50% каждому</li>
            <li>3 варианта = 33% каждому</li>
          </ul>
          <p style={{ marginBottom: 0 }}>
            Чем больше вариантов вы выберете, тем меньше вес каждого.
          </p>
        </div>
      }
      trigger="hover"
      placement="right"
    >
      <InfoCircleFilled style={{ fontSize: 16 }} />
    </Popover>
  );

  return (
    <div className="user-voting">
      <div className="voting-header">
        <h3>Ваш голос:</h3>
        {props.isDelegateVote && (
          <Tag className="delegate-tag" color="default">
            Голос советника
          </Tag>
        )}
        {props.isVoteByDefault && (
          <>
            <Tag className="delegate-tag" color="default">
              Голос по умолчанию
            </Tag>
            <Tooltip title="Голос был сформирован автоматически, на основе текущего состояния голосования, в момент вашего вступления в сообщество.">
              <QuestionCircleOutlined />
            </Tooltip>
          </>
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

      {props.resource === 'rule' && userVote && (
        <div className="noncompliance">
          <Form.Item
            label={
              <>
                Последствия несоблюдения правила&nbsp;
                <MultipleChoiceHint />
              </>
            }
            required
            style={{ marginBottom: 8 }}
          >
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
          </Form.Item>
        </div>
      )}
    </div>
  );
}
