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
import { CompletedSolution, ThinkingDirection } from 'src/interfaces';

interface UserSolution {
  solution: SolutionModel;
  currentVersion: SolutionVersionModel;
  allVersions: SolutionVersionModel[];
}

interface AuthorSolution {
  solution: SolutionModel;
  currentVersion: SolutionVersionModel;
}

export function ChallengeDetail() {
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
  const [completedSolutions, setCompletedSolutions] = useState<
    CompletedSolution[]
  >([]);
  const [totalSolutions, setTotalSolutions] = useState<number>(0);
  const [directions, setDirections] = useState<ThinkingDirection[]>([]);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);

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
      const authorSolutions = await solutionService.list(
        [
          { field: 'user_id', op: 'equals', val: challenge.creator.id },
          { field: 'challenge.id', op: 'equals', val: challenge.id },
        ],
        undefined,
        undefined,
        ['versions']
      );

      if (authorSolutions.data.length > 0) {
        const solution = authorSolutions.data[0];
        const versions = (solution.versions || []).sort(
          (a, b) => b.version_number - a.version_number
        );

        setAuthorSolution({
          solution,
          currentVersion: versions[0],
        });
      }
    } catch (error) {
      console.error('Error loading author solution:', error);
    }
  }, [challenge, isAuthor]);

  // Загрузка решения текущего пользователя
  const fetchUserSolution = useCallback(async () => {
    if (!authData.user?.id || !challenge?.id) return;

    try {
      const userSolutions = await solutionService.list(
        [
          { field: 'user_id', op: 'equals', val: authData.user.id },
          { field: 'challenge.id', op: 'equals', val: challenge.id },
        ],
        undefined,
        undefined,
        ['versions']
      );

      if (userSolutions.data.length > 0) {
        const solution = userSolutions.data[0];
        const versions = (solution.versions || []).sort(
          (a, b) => b.version_number - a.version_number
        );

        setUserSolution({
          solution,
          currentVersion: versions[0],
          allVersions: versions,
        });
      }
    } catch (error) {
      console.error('Error loading user solution:', error);
    }
  }, [authData.user?.id, challenge?.id]);

  const fetchCompletedSolutions = useCallback(async () => {
    const response = await solutionService.list(
      [{ field: 'challenge.id', op: 'equals', val: challenge?.id }],
      undefined,
      undefined,
      ['user']
    );
    setTotalSolutions(response.total);
    const solutionsData = response.data
      .filter((s) => s.status === 'completed')
      .map((solution) => {
        return {
          id: solution.id,
          content: solution.current_content,
          authorName: solution.user?.fullname || 'Аноним',
          authorId: solution.user.id || '',
          createdAt: solution.created_at || '',
          updatedAt: solution.updated_at || '',
          isAuthorLike: solution.is_author_like,
          likesCount: 0,
        };
      });
    setCompletedSolutions(solutionsData);
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
    if (!challenge) return;

    const solution = solutionService.createRecord();
    solution.id = userSolution?.solution.id || '';
    solution.current_content = authorSolutionText;
    solution.challenge = challenge;
    solution.user = authData.getUserRelation();
    solution.status = 'draft';
    const createdSolution = await solutionService.save(solution);

    const newVersion = versionService.createRecord();
    newVersion.content = authorSolutionText;
    newVersion.version_number = 1;
    newVersion.change_description = 'Выбрано решение автора в качестве основы';
    newVersion.solution = createdSolution;
    await versionService.save(newVersion);

    await llmService.solutionPreprocessing(createdSolution.id);

    setShowParticipationModal(false);
    messageApi.success('Решение автора скопировано как основа');
    // Перезагружаем данные пользователя
    await fetchUserSolution();
  };

  const handleSelectDirection = async () => {
    if (!challenge?.id || !authData.user?.id) return;

    setIsLoadingDirections(true);
    try {
      const response = await llmService.getSolutionDirections(
        challenge.id,
        authData.user.id
      );
      setDirections(response.data.directions);
      setShowParticipationModal(false);
      setShowDirectionModal(true);
    } catch (error) {
      console.error('Error getting directions:', error);
      messageApi.error('Ошибка получения направлений');
    } finally {
      setIsLoadingDirections(false);
    }
  };

  const handleStartFromScratch = async () => {
    const solution = solutionService.createRecord();
    solution.challenge = challenge as ChallengeModel;
    solution.user = authData.getUserRelation();
    solution.current_content = '';
    solution.current_content = '';
    const createdSolution = await solutionService.save(solution);

    const newVersion = versionService.createRecord();
    newVersion.solution = createdSolution;
    newVersion.content = '';
    newVersion.version_number = 1;
    newVersion.change_description = 'Оригинальное решение';
    const createdVersion = await versionService.save(newVersion);

    await llmService.solutionPreprocessing(createdSolution.id);

    solution.versions = [createdVersion];
    setUserSolution({
      solution,
      currentVersion: createdVersion,
      allVersions: [createdVersion],
    });
    setShowParticipationModal(false);
    messageApi.success('Создано новое решение');
    await fetchUserSolution();
  };

  const handleDirectionSelected = async (direction: ThinkingDirection) => {
    if (!challenge) return;

    try {
      const solution = solutionService.createRecord();
      solution.challenge = challenge;
      solution.user = authData.getUserRelation();
      solution.current_content = direction.initial_solution_text;
      const createdSolution = await solutionService.save(solution);

      const newVersion = versionService.createRecord();
      newVersion.solution = createdSolution;
      newVersion.content = direction.initial_solution_text;
      newVersion.version_number = 1;
      newVersion.change_description = `Выбран подход: "${direction.title}"`;
      const createdVersion = await versionService.save(newVersion);

      await llmService.solutionPreprocessing(createdSolution.id);

      solution.versions = [createdVersion];
      setUserSolution({
        solution,
        currentVersion: createdVersion,
        allVersions: [createdVersion],
      });

      setShowDirectionModal(false);
      messageApi.success(
        `Направление "${direction.title}" выбрано, создано новое решение`
      );
      await fetchUserSolution();
    } catch (error) {
      console.error('Error creating solution from direction:', error);
      messageApi.error('Ошибка создания решения на основе направления');
    }
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

      setAIResponseData(response.data);
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

    await llmService.solutionPreprocessing(solution.id);

    messageApi.success('Новая версия сохранена');
    await fetchUserSolution();
  };

  const handleDeleteInteraction = async () => {
    setShowAIResponseModal(false);
    if (aiResponseData?.interaction_id) {
      try {
        await llmService.deleteInteraction(aiResponseData.interaction_id);
        messageApi.success('Взаимодействие c КИ удалено');
        await fetchUserSolution();
      } catch (error) {
        console.error('Error deleting interaction:', error);
        messageApi.error('Ошибка удаления взаимодействия c КИ');
      }
    }
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
          <AuthorSolutionCard authorSolution={authorSolution} />
        )}

        {/* Рабочая область пользователя */}
        <UserWorkspaceCard
          challenge={challenge}
          userSolution={userSolution}
          isAuthor={isAuthor}
          onParticipate={handleParticipate}
          onAIRequest={handleAIRequest}
          onSaveNewVersion={handleSaveNewVersion}
          onSolutionDeleted={async () => {
            setUserSolution(null);
            await fetchCompletedSolutions();
          }}
          onStatusChanged={async () => {
            await fetchCompletedSolutions();
          }}
          totalSolutions={totalSolutions}
        />

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
        totalSolutions={totalSolutions}
        loadingDirections={isLoadingDirections}
      />

      <DirectionSelectionModal
        visible={showDirectionModal}
        onCancel={() => {
          setShowDirectionModal(false);
          setDirections([]);
        }}
        onSelect={handleDirectionSelected}
        directions={directions}
        loading={isLoadingDirections}
      />

      <AIResponseModal
        visible={showAIResponseModal}
        onCancel={handleDeleteInteraction}
        responseData={aiResponseData}
        interactionType={aiInteractionType}
        userSolution={userSolution}
        onComplete={async () => {
          setShowAIResponseModal(false);
          setAIResponseData(null);
          setAIInteractionType(null);
          await fetchUserSolution();
        }}
      />
    </div>
  );
}
