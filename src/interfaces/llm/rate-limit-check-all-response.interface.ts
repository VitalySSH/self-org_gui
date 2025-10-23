import { RateLimitCheckResponse } from 'src/interfaces';

export interface RateLimitCheckAllResponse {
  user_id: string;
  request_types: {
    ideas: RateLimitCheckResponse;
    improvements: RateLimitCheckResponse;
    criticism: RateLimitCheckResponse;
    directions: RateLimitCheckResponse;
  };
  timestamp: string;
}
