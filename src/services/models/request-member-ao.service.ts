import { CrudDataSourceService } from "../crud-data-source.service.ts";
import { RequestMemberModel} from "../../models";
import { SettingsStatisticsInterface } from "../../interfaces";
import { AOApiUrl } from "../../config/configuration.ts";


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
