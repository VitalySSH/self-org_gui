import { CrudDataSourceService } from 'src/services';
import { VotingResultModel } from 'src/models';
import { AOApiUrl } from 'src/config/configuration';
import { VoteInPercent } from 'src/interfaces';

export class VotingResultAoService extends CrudDataSourceService<VotingResultModel> {
  constructor() {
    super(VotingResultModel, AOApiUrl);
  }

  async getVoteInPercent(votingResultId: string) {
    const url = `/${this.model.entityName}/vote_in_percent/${votingResultId}`;
    const reps = await this.http.get<VoteInPercent>(url);

    return reps.data;
  }
}
