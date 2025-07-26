import { useState } from 'react';
import { Checkbox, Tag, Form, Tooltip, Popover } from 'antd';
import {
  QuestionCircleOutlined,
  InfoCircleFilled,
  UserOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Pagination, UserVotingProps } from 'src/interfaces';
import { CustomSelect } from 'src/components';
import { CrudDataSourceService } from 'src/services';
import { NoncomplianceModel, VotingOptionModel } from 'src/models';
import { Filters } from 'src/shared/types.ts';
import './user-voting.page.scss';

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
    // Не обрабатываем изменения в readonly режиме
    if (props.readonly) return;

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
      <InfoCircleFilled className="multiple-choice-hint" />
    </Popover>
  );

  return (
    <div className={`user-voting ${props.readonly ? 'readonly-mode' : ''}`}>
      {/* Заголовок секции */}
      <div className="voting-header">
        <h3 className="voting-title">
          <UserOutlined className="voting-icon" />
          Ваш голос
        </h3>
        <div className="voting-tags">
          {props.isDelegateVote && (
            <Tag className="delegate-tag">
              Голос советника
            </Tag>
          )}
          {props.isVoteByDefault && (
            <>
              <Tag className="delegate-tag default-tag">
                Голос по умолчанию
              </Tag>
              <Tooltip title="Голос был сформирован автоматически, на основе текущего состояния голосования, в момент вашего вступления в сообщество.">
                <QuestionCircleOutlined className="info-tooltip" />
              </Tooltip>
            </>
          )}
          {props.readonly && (
            <Tag className="delegate-tag readonly-tag">
              Только для просмотра
            </Tag>
          )}
        </div>
      </div>

      {/* Вопрос для голосования */}
      <div className="voting-question">
        {props.question}
      </div>

      {/* Варианты голосования */}
      <div className="voting-options">
        <div className="vote-option yes-option">
          <Checkbox
            checked={userVote === true}
            onChange={() => handleVote(true)}
            aria-label="Да"
            className={userVote === true ? 'checked' : ''}
            disabled={props.readonly}
          >
            Да
          </Checkbox>
        </div>
        <div className="vote-option no-option">
          <Checkbox
            checked={userVote === false}
            onChange={() => handleVote(false)}
            aria-label="Нет"
            className={userVote === false ? 'checked' : ''}
            disabled={props.readonly}
          >
            Нет
          </Checkbox>
        </div>
      </div>

      {/* Дополнительный вопрос */}
      {userVote && props.isOptions && (
        <div className="additional-question">
          <div className="additional-question-title">
            {props.extraQuestion}
          </div>
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
            readonly={props.readonly}
            addOwnValue={true}
            ownValuePlaceholder="Введите свой вариант"
            ownValueMaxLength={140}
          />
        </div>
      )}

      {/* Последствия несоблюдения правила */}
      {props.resource === 'rule' && userVote && (
        <>
          <div className="noncompliance-title">
            <ExclamationCircleOutlined />
            Последствия несоблюдения правила
            {!props.readonly && <MultipleChoiceHint />}
          </div>
          <div className="noncompliance-section">
            <Form.Item>
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
                readonly={props.readonly}
                addOwnValue={true}
                ownValuePlaceholder="Введите свой вариант"
                ownValueMaxLength={140}
              />
            </Form.Item>
          </div>
        </>
      )}
    </div>
  );
}