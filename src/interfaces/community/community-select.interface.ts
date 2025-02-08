import { UserCommunitySettingsModel } from 'src/models';

export interface CommunitySelectProps {
  parentCommunityId: string;
  parentSettings: UserCommunitySettingsModel;
  readonly: boolean;
  values: UserCommunitySettingsModel[] | undefined;
  onChange: (value: any) => void;
}
