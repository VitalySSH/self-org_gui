import { ApiModel } from "./api-model.model.ts";
import { modelConfig, attribute } from "src/annotations";

@modelConfig({
    entityName: 'community_description',
})
export class CommunityDescriptionModel extends ApiModel{
    @attribute()
    value!: string;

    @attribute()
    creator_id?: string;

    @attribute()
    community_id?: string;

    @attribute()
    is_readonly?: boolean;

}