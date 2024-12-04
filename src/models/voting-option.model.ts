import { ApiModel } from "./api-model.model.ts";
import { attribute, modelConfig } from "src/annotations";

@modelConfig({
    entityName: 'voting_option',
})
export class VotingOptionModel extends ApiModel{

    @attribute()
    content?: string;

    @attribute()
    is_multi_select?: boolean;

    @attribute()
    creator_id?: string;

    @attribute()
    initiative_id?: string;

    @attribute()
    rule_id?: string;

}