import { ApiModel } from "./api-model.model.ts";
import { attribute, manyToMany, modelConfig, oneToMany } from "../annotations";
import { UserModel } from "./user.model.ts";
import { CommunitySettingsModel } from "./community-settings.model.ts";
import { UserCommunitySettingsModel } from "./user-community-settings.model.ts";

@modelConfig({
    entityName: 'community',
})
export class CommunityModel extends ApiModel{
    @oneToMany('community_settings')
    main_settings?: CommunitySettingsModel;

    @manyToMany('user_community_settings')
    user_settings?: UserCommunitySettingsModel[];

    @oneToMany('user')
    creator?: UserModel;

    @attribute()
    created?: Date;

}