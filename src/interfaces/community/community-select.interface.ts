import { UserCommunitySettingsModel } from "src/models";

export interface CommunitySelectProps {
    parentCommunityId: string;
    readonly: boolean;
    values: UserCommunitySettingsModel[] | undefined;
    onChange: (value: any) => void;
}