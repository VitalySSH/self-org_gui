import { ApiModel } from "./api-model.model.ts";
import { attribute, modelConfig } from "../annotations";

@modelConfig({
    entityName: 'opinion',
})
export class OpinionModel extends ApiModel{

    @attribute()
    text?: string;

    @attribute()
    creator_id?: string;

}