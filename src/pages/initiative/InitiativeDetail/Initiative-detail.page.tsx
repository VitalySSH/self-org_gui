import './Initiative-detail.page.scss';
import { Button, Card, message, Spin, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  TagOutlined,
  CalendarOutlined,
  StarOutlined,
  TeamOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { CrudDataSourceService, VotingResultAoService } from 'src/services';
import {
  InitiativeModel,
  UserVotingResultModel,
  VotingOptionModel,
} from 'src/models';
import { Opinions, UserVoting, VotingResults } from 'src/components';
import { AuthContextProvider, VoteInPercent } from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { StatusTag } from 'src/components/StatusTag/status-tag.component.tsx';
import { convertVotingOptions } from 'src/utils/voting.utils.ts';
import { OneDayEventLabel } from 'src/consts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export function InitiativeDetail() {
  const { id } = useParams();
  const authData: AuthContextProvider = useAuth();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [initiative, setInitiative] = useState<InitiativeModel | null>(null);
  const [initiativeStatus, setInitiativeStatus] = useState('');
  const [initiativeStatusCode, setInitiativeStatusCode] = useState('');
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
  const [eventDate, setEventDate] = useState<string | null>(null);

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

  const fetchInitiative = useCallback(
    (forced: boolean = false) => {
      if ((!initiative || forced) && id) {
        const initiativeService = new CrudDataSourceService(InitiativeModel);
        initiativeService
          .get(id, ['status', 'creator', 'voting_result', 'category'])
          .then((initiativeInst) => {
            setInitiative(initiativeInst);
            if (!votingResultId) {
              setVotingResultId(initiativeInst.voting_result?.id);
            }
            const options: string[] = convertVotingOptions(
              initiativeInst.voting_result?.options || {}
            );
            setSelectedOptions(options);
            const _minorityOptions = convertVotingOptions(
              initiativeInst.voting_result?.minority_options || {}
            );
            setMinorityOptions(_minorityOptions);
            setInitiativeStatus(initiativeInst.status?.name || '');
            setInitiativeStatusCode(initiativeInst.status?.code || '');
            if (!eventDate && initiativeInst.event_date) {
              const day = dayjs(initiativeInst.event_date);
              setEventDate(day.format('DD.MM.YYYY'));
            }
          })
          .catch((error) => {
            errorInfo(`Не удалось загрузить данные инициативы: ${error}`);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [initiative, id, errorInfo, votingResultId, eventDate]
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
              field: 'initiative_id',
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
            setUserVote(result.vote);
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
    fetchInitiative();
    fetchVoteInPercent();
    fetchUserVotingResult();
  }, [fetchInitiative, fetchVoteInPercent, fetchUserVotingResult]);

  const handleSelectChange = (_fieldName: string, value: any) => {
    if (value === null) {
      setUserOption([]);
      if (!disabled) setDisabled(true);
    } else {
      const currentValue = Array.isArray(value) ? value : [value];
      setUserOption(currentValue);
      if (disabled && currentValue.length) setDisabled(false);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  const handleVote = (vote: boolean) => {
    setUserVote(vote);
    if (Boolean(initiative?.is_extra_options) && !userOption.length) {
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
              option.initiative_id = initiative?.id;
              option.is_multi_select = initiative?.is_multi_select;
              option.creator_id = initiative?.creator?.id;
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
            fetchInitiative(true);
          }, 1000);
        });
    }
  };

  // Вычисляем статистику для отображения
  const totalVotes = useMemo(() => {
    if (!voteInPercent.yes && !voteInPercent.no && !voteInPercent.abstain) return 0;
    // Предполагаем, что проценты уже рассчитаны от общего количества голосов
    return Math.round(100 / Math.max(voteInPercent.yes || 0.01, voteInPercent.no || 0.01, voteInPercent.abstain || 0.01));
  }, [voteInPercent]);

  const getUserVoteStatus = () => {
    if (!userVotingResult) return 'Не проголосовано';
    if (!userVotingResult.is_voted_myself && userVotingResult.vote !== null && !userVotingResult.is_voted_by_default) {
      return 'Делегированный голос';
    }
    if (userVotingResult.is_voted_by_default) {
      return 'Голос по умолчанию';
    }
    if (userVotingResult.vote === true) return 'ЗА';
    if (userVotingResult.vote === false) return 'ПРОТИВ';
    return 'Воздержался';
  };

  if (loading) {
    return (
      <div className="initiative-detail-page">
        {contextHolder}
        <div className="form-page-container">
          <Card className="initiative-loading-card" variant="borderless">
            <div className="loading-content">
              <Spin size="large" />
              <Text className="loading-text">Загрузка данных инициативы...</Text>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="initiative-detail-page">
        {contextHolder}
        <div className="form-page-container">
          <Card className="initiative-loading-card" variant="borderless">
            <div className="loading-content">
              <Text className="loading-text">Инициатива не найдена</Text>
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
    <>
      {contextHolder}
      <div className="initiative-detail-page">
        <div className="form-page-container">
          {/* Заголовок инициативы */}
          <Card className="initiative-header-card" variant="borderless">
            <div className="initiative-header-content">
              <Title level={1} className="initiative-title">
                {initiative.title}
              </Title>

              <div className="initiative-meta">
                <div className="meta-item">
                  <UserOutlined />
                  <span className="meta-label">Автор:</span>
                  <span className="meta-value">{initiative.creator?.fullname}</span>
                </div>
                <div className="meta-item">
                  <FileTextOutlined />
                  <span className="meta-label">Статус:</span>
                  <StatusTag status={initiativeStatus} statusCode={initiativeStatusCode} />
                </div>
                <div className="meta-item">
                  <TagOutlined />
                  <span className="meta-label">Категория:</span>
                  <span className="meta-value">{initiative.category?.name}</span>
                </div>
                {initiative.is_one_day_event && eventDate && (
                  <div className="meta-item">
                    <CalendarOutlined />
                    <span className="meta-label">Дата события:</span>
                    <span className="meta-value">{eventDate}</span>
                  </div>
                )}
                {initiative.is_one_day_event && (
                  <div className="meta-item event-type-item">
                    <StarOutlined />
                    <span className="meta-label">Тип:</span>
                    <span className="event-type-badge">{OneDayEventLabel}</span>
                  </div>
                )}
              </div>

              <div className="initiative-description">
                <span className="description-label">Описание инициативы:</span>
                {initiative.content}
              </div>

              <div className="initiative-question">
                {initiative.question}
              </div>
            </div>
          </Card>

          {/* Результаты голосования */}
          <div className="initiative-component-wrapper voting-results-wrapper">
            <VotingResults
              yesPercent={voteInPercent.yes}
              noPercent={voteInPercent.no}
              abstainPercent={voteInPercent.abstain}
              resource="initiative"
              initiativeId={id}
              extraQuestion={initiative.extra_question}
              selectedOptions={selectedOptions}
              minorityOptions={minorityOptions}
            />
          </div>

          {/* Голосование пользователя */}
          {userVotingResult && (
            <div className="initiative-component-wrapper user-voting-wrapper">
              <UserVoting
                communityId={userVotingResult.community_id}
                resource="initiative"
                initiativeId={id}
                question={initiative.question || ''}
                extraQuestion={initiative.extra_question || ''}
                vote={userVotingResult.vote}
                isOptions={initiative.is_extra_options || false}
                options={userOption}
                isDelegateVote={
                  !userVotingResult.is_voted_myself &&
                  userVotingResult.vote !== null &&
                  !userVotingResult.is_voted_by_default
                }
                isVoteByDefault={!!userVotingResult.is_voted_by_default}
                onVote={handleVote}
                onSelectChange={handleSelectChange}
              />
            </div>
          )}

          {/* Мнения */}
          <div className="initiative-component-wrapper opinions-wrapper">
            <Opinions maxPageSize={20} resource="initiative" initiativeId={id} />
          </div>
        </div>
      </div>

      {/* Toolbar с кнопками */}
      <div className="toolbar">
        <div className="toolbar-info-left">
          <div className="toolbar-info">
            <TeamOutlined className="info-icon" />
            <span className="info-text">
              Участников: <span className="info-highlight">{totalVotes}</span>
            </span>
          </div>
          <div className={`toolbar-status ${
            userVotingResult?.vote === true ? 'status-success' :
              userVotingResult?.vote === false ? 'status-error' :
                userVotingResult?.vote === null ? 'status-warning' : ''
          }`}>
            <span className="status-icon">●</span>
            <span>{getUserVoteStatus()}</span>
          </div>
        </div>

        <div className="toolbar-actions">
          <Button
            type="default"
            htmlType="button"
            onClick={onCancel}
            className="toolbar-button toolbar-button-secondary"
            icon={<ArrowLeftOutlined />}
          >
            Назад
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={buttonLoading}
            onClick={onFinish}
            disabled={disabled}
            className="toolbar-button toolbar-button-success"
            icon={<CheckCircleOutlined />}
          >
            Проголосовать
          </Button>
        </div>

        <div className="toolbar-info-right">
          {/*<div className="toolbar-info">*/}
          {/*  <ClockCircleOutlined className="info-icon" />*/}
          {/*  <span className="info-text">*/}
          {/*    Статус: <span className="info-highlight">{initiativeStatus}</span>*/}
          {/*  </span>*/}
          {/*</div>*/}
          {/*{initiative.is_one_day_event && eventDate && (*/}
          {/*  <div className="toolbar-meta">*/}
          {/*    Событие: {eventDate}*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
      </div>
    </>
  );
}