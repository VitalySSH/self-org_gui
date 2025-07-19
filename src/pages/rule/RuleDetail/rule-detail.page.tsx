import './rule-detail.page.scss';
import { Button, Card, message, Spin, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  TagOutlined,
  NumberOutlined
} from '@ant-design/icons';
import { CrudDataSourceService, VotingResultAoService } from 'src/services';
import {
  NoncomplianceModel,
  RuleModel,
  UserVotingResultModel,
  VotingOptionModel,
} from 'src/models';
import { Opinions, UserVoting, VotingResults } from 'src/components';
import { AuthContextProvider, VoteInPercent } from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { StatusTag } from 'src/components/StatusTag/status-tag.component.tsx';
import { convertVotingOptions } from 'src/utils/voting.utils.ts';

const { Title, Text } = Typography;

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
  const [noncompliance, setNoncompliance] = useState<NoncomplianceModel[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [minorityOptions, setMinorityOptions] = useState<string[]>([]);
  const [selectedNoncompliance, setSelectedNoncompliance] = useState<string[]>(
    []
  );
  const [minorityNoncompliance, setMinorityNoncompliance] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const userVotingResultService = useMemo(
    () => new CrudDataSourceService(UserVotingResultModel),
    []
  );
  const votingOptionService = new CrudDataSourceService(VotingOptionModel);
  const noncomplianceService = new CrudDataSourceService(NoncomplianceModel);

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
          .get(id, ['status', 'creator', 'voting_result', 'category'])
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
            const _selectedNoncompliance = convertVotingOptions(
              ruleInst.voting_result?.noncompliance || {}
            );
            setSelectedNoncompliance(_selectedNoncompliance);
            const _minorityNoncompliance = convertVotingOptions(
              ruleInst.voting_result?.minority_noncompliance || {}
            );
            setMinorityNoncompliance(_minorityNoncompliance);
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
    [rule, id, errorInfo, votingResultId]
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
          ['extra_options', 'noncompliance']
        )
        .then((resp) => {
          if (resp.total) {
            const result = resp.data[0];
            setUserVotingResult(result);
            setUserVote(result.vote);
            setDisabled(true);
            if (result.vote) setUserOption(result.extra_options || []);
            setNoncompliance(result.noncompliance || []);
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

  const handleSelectChange = (fieldName: string, value: any) => {
    switch (fieldName) {
      case 'options':
        if (value === null) {
          setUserOption([]);
          if (!disabled) setDisabled(true);
        } else {
          const currentValue = Array.isArray(value) ? value : [value];
          setUserOption(currentValue);
          if (disabled && currentValue.length > 0 && noncompliance.length > 0) {
            setDisabled(false);
          }
        }
        break;
      case 'noncompliance':
        if (value === null) {
          setNoncompliance([]);
          if (!disabled) setDisabled(true);
        } else {
          const currentValue = Array.isArray(value) ? value : [value];
          setNoncompliance(currentValue);
          const isOptions = !rule?.is_extra_options
            ? true
            : userOption.length > 0;
          if (disabled && currentValue.length > 0 && isOptions) {
            setDisabled(false);
          }
        }
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  const handleVote = (vote: boolean) => {
    if (userVote && !vote) {
      setUserOption([]);
      setNoncompliance([]);
    }
    setUserVote(vote);
    const isNotOptions = Boolean(rule?.is_extra_options) && !userOption.length;
    if (vote && (isNotOptions || !noncompliance.length)) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  };

  const onFinish = async () => {
    setButtonLoading(true);
    if (userVotingResult) {
      if (userVote !== undefined) {
        userVotingResult.vote = userVote;
      }
      const options: VotingOptionModel[] = [];
      const resultNoncompliance: NoncomplianceModel[] = [];
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
        for (const _noncompliance of Array.isArray(noncompliance)
          ? noncompliance
          : [noncompliance]) {
          if (_noncompliance) {
            if (!_noncompliance?.id) {
              _noncompliance.community_id = rule?.community_id;
              _noncompliance.creator_id = rule?.creator?.id;
              const newNoncompliance = await noncomplianceService.save(
                _noncompliance,
                true
              );
              resultNoncompliance.push(newNoncompliance);
            } else {
              resultNoncompliance.push(_noncompliance);
            }
          }
        }
      }
      userVotingResult.extra_options = options;
      userVotingResult.noncompliance = resultNoncompliance;
      if (!userVotingResult.is_voted_myself) {
        userVotingResult.is_voted_myself = true;
      }
      if (userVotingResult.is_voted_by_default) {
        userVotingResult.is_voted_by_default = false;
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
      <div className="rule-detail-page">
        {contextHolder}
        <div className="form-page-container">
          <Card className="rule-loading-card" variant="borderless">
            <div className="loading-content">
              <Spin size="large" />
              <Text className="loading-text">Загрузка данных правила...</Text>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="rule-detail-page">
        {contextHolder}
        <div className="form-page-container">
          <Card className="rule-loading-card" variant="borderless">
            <div className="loading-content">
              <Text className="loading-text">Правило не найдено</Text>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={onCancel}
                style={{ marginTop: 16 }}
              >
                Вернуться назад
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="rule-detail-page">
      {contextHolder}

      <div className="form-page-container">
        {/* Заголовок правила */}
        <Card className="rule-header-card" variant="borderless">
          <div className="rule-header-content">
            <Title level={1} className="rule-title">
              {rule.title}
            </Title>

            <div className="rule-meta">
              <div className="meta-item">
                <NumberOutlined />
                <span className="meta-label">Номер:</span>
                <span className="meta-value">{rule.tracker}</span>
              </div>
              <div className="meta-item">
                <UserOutlined />
                <span className="meta-label">Автор:</span>
                <span className="meta-value">{rule.creator?.fullname}</span>
              </div>
              <div className="meta-item">
                <TagOutlined />
                <span className="meta-label">Категория:</span>
                <span className="meta-value">{rule.category?.name}</span>
              </div>
              <div className="meta-item">
                <FileTextOutlined />
                <span className="meta-label">Статус:</span>
                <StatusTag status={ruleStatus} statusCode={ruleStatusCode} />
              </div>
            </div>

            <div className="rule-description">
              <span className="description-label">Описание правила:</span>
              {rule.content}
            </div>

            <div className="rule-question">
              {rule.question}
            </div>
          </div>
        </Card>

        {/* Результаты голосования */}
        <Card className="rule-component-card voting-results-card" variant="borderless">
          <VotingResults
            yesPercent={voteInPercent.yes}
            noPercent={voteInPercent.no}
            abstainPercent={voteInPercent.abstain}
            resource="rule"
            ruleId={id}
            extraQuestion={rule.extra_question}
            selectedOptions={selectedOptions}
            minorityOptions={minorityOptions}
            noncompliance={selectedNoncompliance}
            minorityNoncompliance={minorityNoncompliance}
          />
        </Card>

        {/* Голосование пользователя */}
        {userVotingResult && (
          <Card className="rule-component-card user-voting-card" variant="borderless">
            <UserVoting
              communityId={userVotingResult.community_id}
              resource="rule"
              ruleId={id}
              question={rule.question || ''}
              extraQuestion={rule.extra_question || ''}
              vote={userVotingResult.vote}
              isOptions={rule.is_extra_options || false}
              options={userOption}
              noncompliance={noncompliance}
              isDelegateVote={
                !userVotingResult.is_voted_myself &&
                userVotingResult.vote !== null &&
                !userVotingResult.is_voted_by_default
              }
              isVoteByDefault={!!userVotingResult.is_voted_by_default}
              onVote={handleVote}
              onSelectChange={handleSelectChange}
            />
          </Card>
        )}

        {/* Мнения */}
        <Card className="rule-component-card opinions-card" variant="borderless">
          <Opinions maxPageSize={20} resource="rule" ruleId={id} />
        </Card>
      </div>

      {/* Фиксированная панель действий */}
      <div className="rule-actions-bar">
        <div className="actions-container">
          <div className="actions-info">
            <Title level={5} className="actions-title">
              Готовы проголосовать?
            </Title>
            <Text className="actions-subtitle">
              {disabled
                ? 'Заполните все необходимые поля для голосования'
                : 'Все данные заполнены, можно отдать голос'
              }
            </Text>
          </div>
          <div className="actions-buttons">
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={onCancel}
              className="back-button"
            >
              Назад
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={buttonLoading}
              onClick={onFinish}
              disabled={disabled}
              className="vote-button"
            >
              Проголосовать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}