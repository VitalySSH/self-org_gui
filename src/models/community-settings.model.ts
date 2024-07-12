import { ApiModel } from "./api-model.model.ts";
import { attribute, manyToMany, modelConfig, oneToMany } from "../annotations";
import { CommunityDescriptionModel } from "./community-description.model.ts";
import { CommunityNameModel } from "./community-name.model.ts";
import { RequestMemberModel } from "./request-member.model.ts";
import { InitiativeCategoryModel } from "./initiative-category.model.ts";

@modelConfig({
    entityName: 'community_settings',
})
export class CommunitySettingsModel extends ApiModel{
    @oneToMany('community_name')
    name?: CommunityNameModel;

    @oneToMany('community_description')
    description?: CommunityDescriptionModel;

    @attribute()
    quorum?: number;

    @attribute()
    vote?: number;

    @attribute()
    is_secret_ballot?: boolean;

    @attribute()
    is_can_offer?: boolean;

    @attribute()
    is_minority_not_participate?: boolean;

    @manyToMany('initiative_category')
    init_categories?: InitiativeCategoryModel[];

    @manyToMany('request_member')
    adding_members?: RequestMemberModel[];

    @manyToMany('request_member')
    removal_members?: RequestMemberModel[];

}