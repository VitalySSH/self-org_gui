import { CrudDataSourceService } from "../crud-data-source.service.ts";
import { UserCommunitySettingsModel } from "../../models";
import { AOApiPath } from "../../shared/config.ts";
import { CommunitySettingsInterface } from "../../interfaces";


export class UserSettingsAoService
    extends CrudDataSourceService<UserCommunitySettingsModel>{

    constructor() {
        super(UserCommunitySettingsModel, AOApiPath);
    }

    async update_data_after_join(
        community_id: string,
        user_settings_id: string,
        request_member_id: string,
    ) {
        const url = `/${this.model.entityName}/update_data_after_join`;
        const data = {
            community_id,
            user_settings_id,
            request_member_id,
        }

        return this.http.post<void>(url, data);
    }

    async createCommunity(
        settings: CommunitySettingsInterface
    ) {
        const url = `/${this.model.entityName}/create_community`;

        return this.http.post<void>(url, settings);
    }

}
