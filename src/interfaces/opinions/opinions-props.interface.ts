import { Resource } from 'src/shared/types.ts';

export interface OpinionsProps {
  maxPageSize: number;
  resource: Resource;
  ruleId?: string;
  initiativeId?: string;
}
