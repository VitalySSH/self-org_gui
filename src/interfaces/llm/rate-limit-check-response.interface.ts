export interface RateLimitCheckResponse {
  available: boolean;
  request_type: string;
  message: string;
  seconds_remaining: number;
  minutes_remaining?: number;
  formatted_time?: string;
}