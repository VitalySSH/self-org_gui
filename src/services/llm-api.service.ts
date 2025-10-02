import { DataSourceService } from './data-source.service.ts';
import { baseApiUrl } from 'src/config/configuration';
import {
  AIInfluenceResponse,
  CollectiveMetricsResponse,
  CommunityAIOverviewResponse,
  CriticismResponse,
  IdeasResponse,
  ImprovementsResponse,
  IntegrationRequest,
  IntegrationResponse,
  InteractionResponse,
  InteractionSaveResponse,
  SolutionVersionRequest,
  SolutionVersionResponse,
  ThinkingDirectionResponse,
} from 'src/interfaces';

export class LlmApiService extends DataSourceService {
  constructor(baseURL = `${baseApiUrl}/llm`) {
    super(baseURL);
  }

  async getSolutionDirections(challenge_id: string, user_id: string) {
    const url = 'directions/generate';
    const data = { challenge_id, user_id };

    return await this.http.post<ThinkingDirectionResponse>(url, data);
  }

  async getSolutionIdeas(solution_id: string, max_items?: number) {
    const url = 'ideas/request';
    const data = { solution_id };
    if (max_items) data['max_items'] = max_items;

    return await this.http.post<IdeasResponse>(url, data);
  }

  async getSolutionImprovements(solution_id: string, max_items?: number) {
    const url = 'improvements/request';
    const data = { solution_id };
    if (max_items) data['max_items'] = max_items;

    return await this.http.post<ImprovementsResponse>(url, data);
  }

  async getSolutionCriticism(solution_id: string, max_items?: number) {
    const url = 'criticism/request';
    const data = { solution_id };
    if (max_items) data['max_items'] = max_items;

    return await this.http.post<CriticismResponse>(url, data);
  }

  async interactionUserResponse(
    interaction_id: string,
    response: InteractionResponse
  ) {
    const url = `interaction/${interaction_id}/respond`;

    return await this.http.post<InteractionSaveResponse>(url, response);
  }

  async deleteInteraction(interaction_id: string) {
    const url = `interaction/${interaction_id}`;

    return await this.http.delete<void>(url);
  }

  async deleteSolution(solution_id: string) {
    const url = `solution/${solution_id}`;

    return await this.http.delete<void>(url);
  }

  async integrationToSolution(request: IntegrationRequest) {
    const url = 'integration/apply';

    return await this.http.post<IntegrationResponse>(url, request);
  }

  async createSolutionVersion(request: SolutionVersionRequest) {
    const url = 'solution/version/create';

    return await this.http.post<SolutionVersionResponse>(url, request);
  }

  async getSolutionAIInfluence(solution_id: string) {
    const url = `analytics/solution-ai-influence/${solution_id}`;

    return await this.http.get<AIInfluenceResponse>(url);
  }

  async getCollectiveMetrics(challenge_id: string) {
    const url = `analytics/collective-metrics/${challenge_id}`;

    return await this.http.get<CollectiveMetricsResponse>(url);
  }

  async getCommunityAIOverview(community_id: string) {
    const url = `analytics/community-ai-overview/${community_id}`;

    return await this.http.get<CommunityAIOverviewResponse>(url);
  }
}
