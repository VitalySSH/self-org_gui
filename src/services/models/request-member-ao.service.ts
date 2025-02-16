import { CrudDataSourceService } from 'src/services';
import { RequestMemberModel } from 'src/models';
import {
  SettingsStatisticsInterface,
  TableMyMemberRequest,
} from 'src/interfaces';
import { AOApiUrl } from 'src/config/configuration';

export class RequestMemberAoService extends CrudDataSourceService<RequestMemberModel> {
  constructor() {
    super(RequestMemberModel, AOApiUrl);
  }

  async myList() {
    const url = `/${this.model.entityName}/my_list`;

    return this.http.get<TableMyMemberRequest[]>(url);
  }

  async votesInPercent(requestId: string) {
    const url = `/${this.model.entityName}/votes_in_percent/${requestId}`;

    return this.http.get<SettingsStatisticsInterface[]>(url);
  }

  async addNewMember(requestId: string) {
    const url = `/${this.model.entityName}/add_new_member/${requestId}`;

    return this.http.post<void>(url);
  }
}
