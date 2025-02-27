import './rule-detail.page.scss';
import { Button, Card, Form, message, Select, Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CrudDataSourceService, VotingResultAoService } from 'src/services';
import {
  RuleModel,
  UserVotingResultModel,
  VotingOptionModel,
  VotingResultModel,
} from 'src/models';
import {
  Opinions,
  UserVoting,
  VotingResults,
} from 'src/components';
import { AuthContextProvider, VoteInPercent } from 'src/interfaces';
import { useAuth } from 'src/hooks';

export function RuleDetail() {
  const { id } = useParams();
  const authData: AuthContextProvider = useAuth();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [rule, setRule] = useState<RuleModel | null>(null);
  const [votingResultId, setVotingResultId] = useState<string | undefined>(
    undefined
  );
  const [userVotingResult, setUserVotingResult] =
    useState<UserVotingResultModel>({} as VotingResultModel);
  const [voteInPercent, setVoteInPercent] = useState({} as VoteInPercent);
  const [userVote, setUserVote] = useState<boolean | undefined>(undefined);
  const [userOption, setUserOption] = useState<VotingOptionModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const ruleService = new CrudDataSourceService(RuleModel);
  const userVotingResultService = new CrudDataSourceService(
    UserVotingResultModel
  );
  const votingOptionService = new CrudDataSourceService(VotingOptionModel);
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
        .get(id, ['status', 'creator',
          'voting_result.selected_options', 'category'])
        .then((ruleInst) => {
          setRule(ruleInst);
          setVotingResultId(ruleInst.voting_result?.id);
        })
        .catch((error) => {
          errorInfo(`Не удалось загрузить данные правила: ${error}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [rule, id, ruleService]);

  const _fetchVoteInPercent = () => {
    if (votingResultId) {
      votingResultAoService
        .getVoteInPercent(votingResultId)
        .then((resp) => {
          setVoteInPercent(resp);
        })
        .catch((error) => {
          errorInfo(
            `Не удалось получить общие результаты голосования: ${error}`
          );
        });
    }
  };

  const fetchVoteInPercent = useCallback(() => {
    if (!Object.keys(voteInPercent).length) {
      _fetchVoteInPercent();
    }
  }, [_fetchVoteInPercent, voteInPercent]);

  const fetchUserVotingResult = useCallback(() => {
    if (!Object.keys(userVotingResult).length && id) {
      userVotingResultService
        .list(
          [
            {
              field: 'rule_id',
              op: 'equals',
              val: id,
            },
            {
              field: 'member_id',
              op: 'equals',
              val: authData.user?.id,
            },
          ],
          undefined,
          undefined,
          ['extra_options']
        )
        .then((resp) => {
          if (resp.total) {
            const result = resp.data[0];
            setUserVotingResult(result);
            if (result.vote) setUserOption(result.extra_options || []);
          }
        })
        .catch((error) => {
          errorInfo(
            `Не удалось получить пользовательские результаты голосования: ${error}`
          );
        });
    }
  }, [authData, id, userVotingResult, userVotingResultService, errorInfo]);

  useEffect(() => {
    fetchRule();
    fetchVoteInPercent();
    fetchUserVotingResult();
  }, [fetchRule, fetchVoteInPercent, fetchUserVotingResult]);

  const handleSelectChange = (_fieldName: string, value: any) => {
    const currentValue = Array.isArray(value) ? value : [value];
    setUserOption(currentValue);
    if (disabled && currentValue.length) {
      setDisabled(false);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  const handleVote = (vote: boolean) => {
    setUserVote(vote);
    if (vote && !userOption) {
      setDisabled(true);
    }
    if (userVote && !vote) {
      setUserOption([]);
    }
  };

  const onFinish = async () => {
    setButtonLoading(true);
    if (userVotingResult) {
      if (userVote !== undefined) {
        userVotingResult.vote = userVote;
      }
      const options: VotingOptionModel[] = [];
      if (userVote) {
        for (const option of Array.isArray(userOption)
          ? userOption
          : [userOption]) {
          if (option) {
            if (!option?.id) {
              option.rule_id = rule?.id;
              option.is_multi_select = rule?.is_multi_select;
              option.creator_id = rule?.creator?.id;
              const newOption = await votingOptionService.save(option, true);
              options.push(newOption);
            } else {
              options.push(option);
            }
          }
        }
      }
      userVotingResult.extra_options = options;
      if (!userVotingResult.is_voted_myself) {
        userVotingResult.is_voted_myself = true;
      }
      userVotingResultService
        .save(userVotingResult, false)
        .then(() => {
          successInfo('Голос отдан');
          _fetchVoteInPercent();
        })
        .catch((error) => {
          errorInfo(`Ошибка при сохранении результатов голосования: ${error}`);
        })
        .finally(() => {
          setButtonLoading(false);
        });
    }
  };

  if (loading) {
    return (
      <div className="form-container">
        <div className="loading-spinner" aria-live="polite" aria-busy="true">
          <Spin size="large" />
        </div>
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
        <Card className="rule-card">
          <h2>{rule.title}</h2>
          <div>
            <strong>Автор:</strong> {rule.creator?.fullname}
          </div>
          <div>
            <strong>Статус:</strong> {rule.status?.name}
          </div>
          <div>
            <strong>Категория:</strong> {rule.category?.name}
          </div>
          <p className="rule-description">
            <strong>Описание: </strong>
            {rule.content}
          </p>
          <i className="rule-question">{rule.question}</i>

          <VotingResults
            yesPercent={voteInPercent.yes}
            noPercent={voteInPercent.no}
            abstainPercent={voteInPercent.abstain}
          />
          {rule.is_extra_options && (
            <div>
              <i className="rule-question">{rule.extra_question}</i>
              <Form.Item>
                <Select
                  mode="multiple"
                  value={(rule.voting_result?.selected_options || []).map(
                    (it) => it.content
                  )}
                  suffixIcon={null}
                  open={false}
                  removeIcon={null}
                ></Select>
              </Form.Item>
            </div>
          )}

          <UserVoting
            resource="rule"
            ruleId={id}
            question={rule.question || ''}
            extraQuestion={rule.extra_question || ''}
            vote={userVotingResult.vote}
            isOptions={rule.is_extra_options || false}
            options={userOption}
            isMultiSelect={rule.is_multi_select || false}
            onVote={handleVote}
            onSelectChange={handleSelectChange}
          />
          <Opinions maxPageSize={20} resource="rule" ruleId={id} />
        </Card>
      </div>
      <div className="toolbar">
        <Button
          type="primary"
          htmlType="submit"
          loading={buttonLoading}
          onClick={onFinish}
          disabled={disabled}
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
