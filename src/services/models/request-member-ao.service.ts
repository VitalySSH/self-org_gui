import { CrudDataSourceService } from "src/services";
import { RequestMemberModel} from "src/models";
import { SettingsStatisticsInterface } from "src/interfaces";
import { AOApiUrl } from "src/config/configuration";


export class RequestMemberAoService
    extends CrudDataSourceService<RequestMemberModel>{

    constructor() {
        super(RequestMemberModel, AOApiUrl);
    }

    async votesInPercen(id: string) {
        const url = `/${this.model.entityName}/votes_in_percen/${id}`;

        return this.http.get<SettingsStatisticsInterface[]>(url);
    }

}
