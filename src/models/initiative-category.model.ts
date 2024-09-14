import { ApiModel } from "./api-model.model.ts";
import { modelConfig, attribute, oneToMany } from "../annotations";
import { UserModel } from "./user.model.ts";
import { StatusModel } from "./status.model.ts";

@modelConfig({
    entityName: 'initiative_category',
})
export class InitiativeCategoryModel extends ApiModel{
    @attribute()
    name?: string;

    @attribute()
    community_id?: string;

    @oneToMany('user')
    creator?: UserModel;

    @oneToMany('status')
    status?: StatusModel;

}