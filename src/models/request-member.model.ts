import { ApiModel } from "./api-model.model.ts";
import { modelConfig, attribute, oneToMany } from "src/annotations";
import { UserModel } from "./user.model.ts";
import { StatusModel } from "./status.model.ts";
import { CommunityModel } from "./community.model.ts";

@modelConfig({
    entityName: 'request_member',
})
export class RequestMemberModel extends ApiModel{
    @oneToMany('user')
    member?: UserModel;

    @oneToMany('community')
    community?: CommunityModel;

    @oneToMany('status')
    status?: StatusModel;

    @attribute()
    vote?: boolean;

    @attribute()
    reason?: string;

    @attribute()
    parent_id?: string;

    @attribute()
    created?: Date;

    @attribute()
    updated?: Date;

}