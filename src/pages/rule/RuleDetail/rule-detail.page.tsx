import { Button, Card, message, Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CrudDataSourceService, VotingResultAoService } from 'src/services';
import { RuleModel, VotingOptionModel, VotingResultModel } from 'src/models';
import { Opinions, UserVoting, VotingResults } from 'src/components';
import { VoteInPercent } from 'src/interfaces';

export function RuleDetail() {
  const { id } = useParams();

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [rule, setRule] = useState<RuleModel | null>(null);
  const [votingResult, setVotingResult] =
    useState<VotingResultModel | undefined>({} as VotingResultModel);
  const [voteInPercent, setVoteInPercent] = useState({} as VoteInPercent);
  const [userVote, setUserVote] = useState<boolean | undefined>(undefined);
  const [userOption, setUserOption] =
    useState<VotingOptionModel | VotingOptionModel[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const [buttonLoading, setButtonLoading] = useState(false);

  const ruleService =
    new CrudDataSourceService(RuleModel);
  const votingResultService =
    new CrudDataSourceService(VotingResultModel);
  const votingOptionService =
    new CrudDataSourceService(VotingOptionModel);
  const votingResultAoService = new VotingResultAoService();

  const successInfo = (content: string) => {
    messageApi
      .open({
        type: 'success',
        content: content,
      })
      .then();
  };

  const errorInfo = (content: string) => {
    messageApi
      .open({
        type: 'error',
        content: content,
      })
      .then();
  };

  const fetchRule = useCallback(() => {
    if (!rule && id) {
      ruleService
        .get(id, ['status', 'creator', 'voting_result', 'category'])
        .then((ruleInst) => {
          setRule(ruleInst);
          setVotingResult(ruleInst.voting_result);
        })
        .catch((error) => {
          errorInfo(`Не удалось загрузить данные правила: ${error}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [rule, id, ruleService]);

  const fetchVoteInPercent = useCallback(() => {
    if (!Object.keys(voteInPercent).length && votingResult?.id) {
      votingResultAoService.getVoteInPercent(votingResult.id)
        .then((resp) => {
          setVoteInPercent(resp);
        })
        .catch((error) => {
          errorInfo(`Не удалось получить результаты голосования: ${error}`);
        });
    }
  }, [votingResult, voteInPercent, votingResultAoService]);

  useEffect(() => {
    fetchRule();
    fetchVoteInPercent();
  }, [fetchRule, fetchVoteInPercent]);

  const handleSelectChange = (_fieldName: string, value: any) => {
    setUserOption(value);
  };

  const onCancel = () => {
    navigate(-1);
  };

  const handleVote = (vote: boolean) => {
    setUserVote(vote);
  }

  const onFinish = async () => {
    setButtonLoading(true);
    if (votingResult) {
      votingResult.vote = userVote;
      const options: VotingOptionModel[] = [];
      for (const option of Array.isArray(userOption) ? userOption : [userOption]) {
        if (option) {
          if (!option?.id) {
            option.rule_id = rule?.id;
            option.is_multi_select = rule?.is_multi_select;
            option.creator_id = rule?.creator?.id;
            const newOption =
              await votingOptionService.save(option, true);
            options.push(newOption);
          } else {
            options.push(option);
          }
        }
      }
      if (options.length) {
        votingResult.selected_options = options;
      }
      votingResultService.save(votingResult, false).then(() => {
        successInfo('Голос отдан');
      }).catch((error) => {
        errorInfo(`Ошибка при сохранении результатов голосования: ${error}`);
      }).finally(() => {
        setButtonLoading(false);
      });
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner" aria-live="polite" aria-busy="true">
        <Spin size="large" />
      </div>
    );
  }

  if (!rule) {
    return null;
  }

  return (
    <>
      {contextHolder}
      <div className="form-container">
        <div className="form-header">{rule.title}</div>
        <Card className="rule-card" aria-labelledby="rule-title">
          <h2 id="rule-title" className="rule-title">
            {rule.title}
          </h2>
          <div className="rule-author">
            <strong>Автор:</strong> {rule.creator?.fullname}
          </div>
          <div className="rule-status">
            <strong>Статус:</strong> {rule.status?.name}
          </div>
          <div className="rule-category">
            <strong>Категория:</strong> {rule.category?.name}
          </div>
          <p className="rule-description">{rule.content}</p>
          <i className="rule-question">{rule.question}</i>

          <VotingResults
            yesPercent={voteInPercent.yes}
            noPercent={voteInPercent.no}
            abstainPercent={voteInPercent.abstain}
          />
          <UserVoting
            resource="rule"
            ruleId={id}
            extraQuestion={rule.extra_question || ''}
            vote={rule.voting_result?.vote}
            options={rule.options}
            isMultiSelect={rule.is_multi_select || false}
            onVote={handleVote}
            onSelectChange={handleSelectChange}
          />
          <Opinions
            maxPageSize={20}
            resource="rule"
            ruleId={id}
          />
        </Card>
      </div>
      <div className="toolbar">
        <Button
          type="primary"
          htmlType="submit"
          loading={buttonLoading}
          onClick={onFinish}
          className="toolbar-button"
        >
          Проголосовать
        </Button>
        <Button
          type="primary"
          htmlType="button"
          onClick={onCancel}
          className="toolbar-button"
        >
          Назад
        </Button>
      </div>
    </>
  );
}
