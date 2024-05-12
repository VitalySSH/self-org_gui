import { ApiModel } from "./api-model.model.ts";
import { modelConfig, attribute, oneToMany } from "../annotations";
import { UserModel } from "./user.model.ts";
import { StatusModel } from "./status.model.ts";

@modelConfig({
    entityName: 'request_member',
})
export class RequestMemberModel extends ApiModel{
    @oneToMany()
    member?: UserModel;

    @oneToMany()
    creator?: UserModel;

    // @oneToMany()
    // community?: string;

    @oneToMany()
    status?: StatusModel;

    @attribute()
    vote?: boolean;

    @attribute()
    reason?: string;

    @attribute()
    parent_id?: string;

    @attribute()
    is_removal?: boolean;

    @attribute()
    created?: Date;

    @attribute()
    updated?: Date;

}