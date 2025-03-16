import './rule-detail.page.scss';
import { Button, Card, Flex, message, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CrudDataSourceService, VotingResultAoService } from 'src/services';
import {
  RuleModel,
  UserVotingResultModel,
  VotingOptionModel,
} from 'src/models';
import { Opinions, UserVoting, VotingResults } from 'src/components';
import {
  AuthContextProvider,
  VoteInPercent,
} from "src/interfaces";
import { useAuth } from 'src/hooks';
import { StatusTag } from 'src/components/StatusTag/status-tag.component.tsx';
import { convertVotingOptions } from "src/utils/voting.utils.ts";

export function RuleDetail() {
  const { id } = useParams();
  const authData: AuthContextProvider = useAuth();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [rule, setRule] = useState<RuleModel | null>(null);
  const [ruleStatus, setRuleStatus] = useState('');
  const [ruleStatusCode, setRuleStatusCode] = useState('');
  const [votingResultId, setVotingResultId] = useState<string | undefined>(
    undefined
  );
  const [userVotingResult, setUserVotingResult] =
    useState<UserVotingResultModel | null>(null);
  const [voteInPercent, setVoteInPercent] = useState({} as VoteInPercent);
  const [userVote, setUserVote] = useState<boolean | undefined>(undefined);
  const [userOption, setUserOption] = useState<VotingOptionModel[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [minorityOptions, setMinorityOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const userVotingResultService = useMemo(
    () => new CrudDataSourceService(UserVotingResultModel),
    []
  );
  const votingOptionService = new CrudDataSourceService(VotingOptionModel);

  const successInfo = (content: string) => {
    messageApi
      .open({
        type: 'success',
        content: content,
      })
      .then();
  };

  const errorInfo = useCallback(
    (content: string) => {
      messageApi
        .open({
          type: 'error',
          content: content,
        })
        .then();
    },
    [messageApi]
  );

  const fetchRule = useCallback(
    (forced: boolean = false) => {
      if ((!rule || forced) && id) {
        const ruleService = new CrudDataSourceService(RuleModel);
        ruleService
          .get(id, [
            'status',
            'creator',
            'voting_result',
            'category',
          ])
          .then((ruleInst) => {
            setRule(ruleInst);
            if (!votingResultId) {
              setVotingResultId(ruleInst.voting_result?.id);
            }
            const options: string[] = convertVotingOptions(
              ruleInst.voting_result?.options || {}
            );
            setSelectedOptions(options);
            const _minorityOptions = convertVotingOptions(
              ruleInst.voting_result?.minority_options || {}
            );
            setMinorityOptions(_minorityOptions);
            setRuleStatus(ruleInst.status?.name || '');
            setRuleStatusCode(ruleInst.status?.code || '');
          })
          .catch((error) => {
            errorInfo(`Не удалось загрузить данные правила: ${error}`);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [rule, id, errorInfo]
  );

  const _fetchVoteInPercent = useCallback(() => {
    if (votingResultId) {
      const votingResultAoService = new VotingResultAoService();
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
  }, [errorInfo, votingResultId]);

  const fetchVoteInPercent = useCallback(() => {
    if (!Object.keys(voteInPercent).length) {
      _fetchVoteInPercent();
    }
  }, [_fetchVoteInPercent, voteInPercent]);

  const fetchUserVotingResult = useCallback(() => {
    if (!userVotingResult && id) {
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
            setDisabled(true);
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
    if (vote && rule?.is_extra_options && !userOption.length) {
      setDisabled(true);
    } else {
      setDisabled(false);
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
          setDisabled(true);
          // FIXME: Решение временное, потом переделать на вебсокеты
          setTimeout(() => {
            fetchRule(true);
          }, 1000);
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
            <Flex align="center" gap={8}>
              <strong>Статус:</strong>
              <StatusTag status={ruleStatus} statusCode={ruleStatusCode} />
            </Flex>
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
            extraQuestion={rule.extra_question}
            selectedOptions={selectedOptions}
            minorityOptions={minorityOptions}
          />

          {userVotingResult && (
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
          )}
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
