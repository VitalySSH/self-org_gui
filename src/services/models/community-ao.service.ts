import { CrudDataSourceService } from "src/services";
import { CommunityModel } from "src/models";
import { Filters, Orders } from "src/shared/types";
import {
    CrudApiDataInterface,
    Pagination,
    SettingsInPercenInterface,
} from "src/interfaces";
import { AOApiUrl } from "src/config/configuration";


export class CommunityAOService
    extends CrudDataSourceService<CommunityModel>{

    constructor() {
        super(CommunityModel, AOApiUrl);
    }

    async myList(
        filters?: Filters,
        orders?: Orders,
        pagination?: Pagination,
        include?: string[]
    ) {
        const url = `/${this.model.entityName}/my_list`;
        const data = {
            filters,
            orders,
            pagination,
            include,
        }

        const r =
            await this.http.post<CrudApiDataInterface[]>(url, data);
        const records: CommunityModel[] = [];
        r.data.forEach((item) => {
            const record = this.jsonApiToModel(item);
            records.push(record);
        });

        return records;
    }

    async settingsInPercen(communityId: string) {
        const url =
            `/${this.model.entityName}/settings_in_percen/${communityId}`;

        return this.http.get<SettingsInPercenInterface>(url);
    }

}
