import { ApiModel } from "./api-model.model.ts";
import { modelConfig, attribute, oneToMany } from "../annotations";
import { UserModel } from "./user.model.ts";
import { StatusModel } from "./status.model.ts";

@modelConfig({
    entityName: 'initiative_category',
})
export class InitiativeCategoryModel extends ApiModel{
    @attribute()
    name?: boolean;

    @attribute()
    community_id?: boolean;

    @oneToMany('user')
    creator?: UserModel;

    @oneToMany('status')
    status?: StatusModel;

}