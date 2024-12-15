export interface CreatingRuleInterface {
    title: string;
    question: string;
    content: string;
    is_extra_options: boolean;
    is_multi_select: boolean;
    community_id: string;
    category_id: string;
    extra_options: string[];
}