import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, message } from 'antd';
import { useAuth } from 'src/hooks';
import { CrudDataSourceService, LlmApiService } from 'src/services';
import {
  ChallengeModel,
  SolutionModel,
  SolutionVersionModel,
} from 'src/models';
import {
  ChallengeInfoCard,
  AuthorSolutionCard,
  UserWorkspaceCard,
  CompletedSolutionsCard,
  ParticipationInviteModal,
  DirectionSelectionModal,
  AIResponseModal,
} from 'src/components';
import './challenge-detail.page.scss';

interface ChallengeDetailPageProps {
  communityId: string;
}

interface UserSolution {
  solution: SolutionModel;
  currentVersion: SolutionVersionModel;
  allVersions: SolutionVersionModel[];
}

interface AuthorSolution {
  solution: SolutionModel;
  currentVersion: SolutionVersionModel;
}

export function ChallengeDetail(props: ChallengeDetailPageProps) {
  const { id } = useParams();
  const authData = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  // Основные состояния
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<ChallengeModel | null>(null);
  const [authorSolution, setAuthorSolution] = useState<AuthorSolution | null>(
    null
  );
  const [userSolution, setUserSolution] = useState<UserSolution | null>(null);
  const [completedSolutions, setCompletedSolutions] = useState<any[]>([]);

  // Состояния модальных окон
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showDirectionModal, setShowDirectionModal] = useState(false);
  const [showAIResponseModal, setShowAIResponseModal] = useState(false);
  const [aiResponseData, setAIResponseData] = useState<any>(null);
  const [aiInteractionType, setAIInteractionType] = useState<
    'ideas' | 'improvements' | 'criticism' | null
  >(null);

  // Сервисы
  const challengeService = new CrudDataSourceService(ChallengeModel);
  const solutionService = new CrudDataSourceService(SolutionModel);
  const versionService = new CrudDataSourceService(SolutionVersionModel);
  const llmService = new LlmApiService();

  // Проверяем, является ли пользователь автором задачи
  const isAuthor = challenge?.creator?.id === authData.user?.id;

  // Загрузка данных о задаче
  const fetchChallenge = useCallback(async () => {
    if (!id) return;

    try {
      const challengeData = await challengeService.get(id, [
        'creator',
        'status',
        'category',
      ]);
      setChallenge(challengeData);
    } catch (error) {
      console.error('Error loading challenge:', error);
      messageApi.error('Ошибка загрузки задачи');
    }
  }, [id]);

  // Загрузка решения автора - только если пользователь НЕ автор
  const fetchAuthorSolution = useCallback(async () => {
    if (!challenge?.creator?.id || isAuthor) return;

    try {
      const authorSolutions = await solutionService.list([
        { field: 'user_id', op: 'equals', val: challenge.creator.id },
        { field: 'challenge.id', op: 'equals', val: challenge.id },
      ]);

      if (authorSolutions.data.length > 0) {
        const solution = authorSolutions.data[0];
        const versions = await versionService.list(
          [{ field: 'solution.id', op: 'equals', val: solution.id }],
          [{ field: 'version_number', direction: 'desc' }]
        );

        if (versions.data.length > 0) {
          setAuthorSolution({
            solution,
            currentVersion: versions.data[0],
          });
        }
      }
    } catch (error) {
      console.error('Error loading author solution:', error);
    }
  }, [challenge, isAuthor]);

  // Загрузка решения текущего пользователя
  const fetchUserSolution = useCallback(async () => {
    if (!authData.user?.id || !challenge?.id) return;

    try {
      const userSolutions = await solutionService.list([
        { field: 'user_id', op: 'equals', val: authData.user.id },
        { field: 'challenge.id', op: 'equals', val: challenge.id },
      ]);

      if (userSolutions.data.length > 0) {
        const solution = userSolutions.data[0];
        const versions = await versionService.list(
          [{ field: 'solution.id', op: 'equals', val: solution.id }],
          [{ field: 'version_number', direction: 'desc' }]
        );

        setUserSolution({
          solution,
          currentVersion: versions.data[0],
          allVersions: versions.data,
        });
      }
    } catch (error) {
      console.error('Error loading user solution:', error);
    }
  }, [authData.user?.id, challenge?.id]);

  // Загрузка готовых решений
  const fetchCompletedSolutions = useCallback(async () => {
    // TODO: Заглушка - реализовать получение решений со статусом 'completed'
    setCompletedSolutions([]);
  }, [challenge?.id]);

  // Основная загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchChallenge();
      setLoading(false);
    };

    loadData();
  }, [fetchChallenge]);

  // Загрузка зависимых данных после получения challenge
  useEffect(() => {
    if (challenge) {
      fetchAuthorSolution();
      fetchUserSolution();
      fetchCompletedSolutions();
    }
  }, [
    challenge,
    fetchAuthorSolution,
    fetchUserSolution,
    fetchCompletedSolutions,
  ]);

  // Обработчики действий
  const handleParticipate = () => {
    setShowParticipationModal(true);
  };

  const handleUseAuthorSolution = async (authorSolutionText: string) => {
    // TODO: Создание нового решения на основе решения автора
    setShowParticipationModal(false);
    messageApi.success('Решение автора скопировано как основа');
    // Перезагружаем данные пользователя
    await fetchUserSolution();
  };

  const handleSelectDirection = async () => {
    if (!challenge?.id || !authData.user?.id) return;

    try {
      const directions = await llmService.getSolutionDirections(
        challenge.id,
        authData.user.id
      );
      // TODO: Показать модальное окно с направлениями
      setShowDirectionModal(true);
    } catch (error) {
      console.error('Error getting directions:', error);
      messageApi.error('Ошибка получения направлений');
    }
  };

  const handleStartFromScratch = async () => {
    // TODO: Создание пустого решения
    setShowParticipationModal(false);
    messageApi.success('Создано новое решение');
    await fetchUserSolution();
  };

  const handleAIRequest = async (
    type: 'ideas' | 'improvements' | 'criticism'
  ) => {
    if (!userSolution?.solution.id) return;

    try {
      setAIInteractionType(type);
      let response;

      switch (type) {
        case 'ideas':
          response = await llmService.getSolutionIdeas(
            userSolution.solution.id
          );
          break;
        case 'improvements':
          response = await llmService.getSolutionImprovements(
            userSolution.solution.id
          );
          break;
        case 'criticism':
          response = await llmService.getSolutionCriticism(
            userSolution.solution.id
          );
          break;
      }

      setAIResponseData(response);
      setShowAIResponseModal(true);
    } catch (error) {
      console.error(`Error getting ${type}:`, error);
      messageApi.error(
        `Ошибка получения ${type === 'ideas' ? 'идей' : type === 'improvements' ? 'улучшений' : 'критики'}`
      );
    }
  };

  const handleSaveNewVersion = async (
    content: string,
    versionNumber: number
  ) => {
    const solution = solutionService.createRecord();
    solution.id = userSolution?.solution.id || '';
    solution.current_content = content;
    await solutionService.save(solution);

    const newVersion = versionService.createRecord();
    newVersion.content = content;
    newVersion.version_number = versionNumber;
    newVersion.change_description = 'Версия обновлена по инициативе автора';

    newVersion.solution = solution;
    await versionService.save(newVersion);
    messageApi.success('Новая версия сохранена');
    await fetchUserSolution();
  };

  if (loading) {
    return (
      <div className="challenge-detail-page loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="challenge-detail-page error">
        <Card>
          <p>Задача не найдена</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="challenge-detail-page">
      {contextHolder}

      {/* Основной контент */}
      <div className="challenge-content">
        {/* Информация о задаче */}
        <ChallengeInfoCard challenge={challenge} isAuthor={isAuthor} />

        {authorSolution && !isAuthor && (
          <AuthorSolutionCard
            authorSolution={authorSolution}
            authorName={
              challenge.creator?.first_name + ' ' + challenge.creator?.last_name
            }
          />
        )}

        {/* Рабочая область пользователя */}
        {userSolution && (
          <UserWorkspaceCard
            challenge={challenge}
            userSolution={userSolution}
            isAuthor={isAuthor}
            onParticipate={handleParticipate}
            onAIRequest={handleAIRequest}
            onSaveNewVersion={handleSaveNewVersion}
          />
        )}

        {/* Готовые решения */}
        <CompletedSolutionsCard
          solutions={completedSolutions}
          isAuthor={isAuthor}
        />
      </div>

      {/* Модальные окна */}
      <ParticipationInviteModal
        visible={showParticipationModal}
        onCancel={() => setShowParticipationModal(false)}
        onUseAuthorSolution={() =>
          handleUseAuthorSolution(authorSolution?.currentVersion.content || '')
        }
        onSelectDirection={handleSelectDirection}
        onStartFromScratch={handleStartFromScratch}
        hasAuthorSolution={!!authorSolution}
        totalSolutions={completedSolutions.length + (authorSolution ? 1 : 0)}
      />

      <DirectionSelectionModal
        visible={showDirectionModal}
        onCancel={() => setShowDirectionModal(false)}
        onSelect={(direction) => {
          // TODO: Создать решение на основе выбранного направления
          setShowDirectionModal(false);
          messageApi.success('Направление выбрано, создано новое решение');
          fetchUserSolution();
        }}
      />

      <AIResponseModal
        visible={showAIResponseModal}
        onCancel={() => setShowAIResponseModal(false)}
        responseData={aiResponseData}
        interactionType={aiInteractionType}
        userSolution={userSolution}
        onComplete={() => {
          setShowAIResponseModal(false);
          setAIResponseData(null);
          setAIInteractionType(null);
          fetchUserSolution();
        }}
      />
    </div>
  );
}
