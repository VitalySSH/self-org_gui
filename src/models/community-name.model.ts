import { ApiModel } from "./api-model.model.ts";
import { modelConfig, attribute } from "../annotations";

@modelConfig({
    entityName: 'community_name',
})
export class CommunityNameModel extends ApiModel{
    @attribute()
    name?: string;

    @attribute()
    creator_id?: string;

    @attribute()
    community_id?: string;

    @attribute()
    is_readonly?: boolean;

}