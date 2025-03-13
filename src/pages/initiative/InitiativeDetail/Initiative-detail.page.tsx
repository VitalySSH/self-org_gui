import './Initiative-detail.page.scss';
import { Button, Card, Flex, Form, message, Select, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CrudDataSourceService, VotingResultAoService } from 'src/services';
import {
  InitiativeModel,
  UserVotingResultModel,
  VotingOptionModel
} from "src/models";
import { Opinions, UserVoting, VotingResults } from 'src/components';
import { AuthContextProvider, VoteInPercent } from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { StatusTag } from 'src/components/StatusTag/status-tag.component.tsx';

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

  const fetchInitiative = useCallback(
    (isStatusOnly: boolean = false) => {
      if ((!initiative || isStatusOnly) && id) {
        const initiativeService = new CrudDataSourceService(InitiativeModel);
        initiativeService
          .get(id, [
            'status',
            'creator',
            'voting_result.selected_options',
            'category',
          ])
          .then((initiativeInst) => {
            if (!isStatusOnly) {
              setInitiative(initiativeInst);
              setVotingResultId(initiativeInst.voting_result?.id);
            }
            setInitiativeStatus(initiativeInst.status?.name || '');
            setInitiativeStatusCode(initiativeInst.status?.code || '');
          })
          .catch((error) => {
            errorInfo(`Не удалось загрузить данные инициативы: ${error}`);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [initiative, id, errorInfo]
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
    if (vote && initiative?.is_extra_options && !userOption.length) {
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
          setInitiative(null);
          // FIXME: Решение временное, потом переделать на вебсокеты
          setTimeout(() => {
            fetchInitiative(true);
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

  if (!initiative) {
    return null;
  }

  return (
    <>
      {contextHolder}
      <div className="form-container">
        <Card className="initiative-card">
          <h2>{initiative.title}</h2>
          <div>
            <strong>Автор:</strong> {initiative.creator?.fullname}
          </div>
          <div>
            <Flex align="center" gap={8}>
              <strong>Статус:</strong>
              <StatusTag status={initiativeStatus} statusCode={initiativeStatusCode} />
            </Flex>
          </div>
          <div>
            <strong>Категория:</strong> {initiative.category?.name}
          </div>
          <p className="initiative-description">
            <strong>Описание: </strong>
            {initiative.content}
          </p>
          <i className="initiative-question">{initiative.question}</i>

          <VotingResults
            yesPercent={voteInPercent.yes}
            noPercent={voteInPercent.no}
            abstainPercent={voteInPercent.abstain}
          />
          {initiative.is_extra_options && (
            <div>
              <i className="initiative-question">{initiative.extra_question}</i>
              <Form.Item>
                <Select
                  mode="multiple"
                  value={(initiative.voting_result?.selected_options || []).map(
                    (it) => it.content
                  )}
                  suffixIcon={null}
                  open={false}
                  removeIcon={null}
                ></Select>
              </Form.Item>
            </div>
          )}

          {userVotingResult && (
            <UserVoting
              resource="initiative"
              initiativeId={id}
              question={initiative.question || ''}
              extraQuestion={initiative.extra_question || ''}
              vote={userVotingResult.vote}
              isOptions={initiative.is_extra_options || false}
              options={userOption}
              isMultiSelect={initiative.is_multi_select || false}
              onVote={handleVote}
              onSelectChange={handleSelectChange}
            />
          )}
          <Opinions maxPageSize={20} resource="initiative" initiativeId={id} />
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
