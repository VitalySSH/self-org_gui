import { CrudDataSourceService } from 'src/services';
import { CommunityModel } from 'src/models';
import { Filters, Orders } from 'src/shared/types';
import {
  CommunityCardInterface,
  CommunityNameDataInterface,
  CrudApiListResponse,
  ListResponse,
  Pagination,
  SettingsInPercentInterface,
} from 'src/interfaces';
import { AOApiUrl } from 'src/config/configuration';

export class CommunityAOService extends CrudDataSourceService<CommunityModel> {
  constructor() {
    super(CommunityModel, AOApiUrl);
  }

  async myList(
    filters?: Filters,
    orders?: Orders,
    pagination?: Pagination,
    include?: string[]
  ): Promise<ListResponse<CommunityModel>> {
    const url = `/${this.model.entityName}/my_list`;
    const data = {
      filters,
      orders,
      pagination,
      include,
    };

    const r = await this.http.post<CrudApiListResponse>(url, data);
    const records: CommunityModel[] = [];
    r.data.items.forEach((item) => {
      const record = this.jsonApiToModel(item);
      records.push(record);
    });

    return { data: records, total: r.data.total };
  }

  async getNameData(communityId: string) {
    const url = `/${this.model.entityName}/name/${communityId}`;

    return this.http.get<CommunityNameDataInterface>(url).then((r) => r.data);
  }

  async getSubCommunities(communityId: string) {
    const url = `/${this.model.entityName}/sub_communities/${communityId}`;

    return this.http.get<CommunityCardInterface[]>(url).then((r) => r.data);
  }

  async settingsInPercent(communityId: string) {
    const url = `/${this.model.entityName}/settings_in_percent/${communityId}`;

    return this.http.get<SettingsInPercentInterface>(url).then((r) => r.data);
  }
}
