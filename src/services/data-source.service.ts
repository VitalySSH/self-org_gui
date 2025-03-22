import axios, { AxiosInstance } from 'axios';
import { AuthApiClientService } from './auth-api-client.service.ts';
import { CurrentUserService } from './current-user.service.ts';

export class DataSourceService {
  http: AxiosInstance;
  authApiClientService = new AuthApiClientService();

  constructor(baseURL: string) {
    this.http = axios.create({
      baseURL: baseURL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    this.refreshToken();
  }

  private refreshToken() {
    this.http.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalConfig = error.config;
        const userData = CurrentUserService.user;

        if (
          userData &&
          userData.secret_password &&
          error.response?.status === 401 &&
          !originalConfig._retry
        ) {
          originalConfig._retry = true;
          await this.authApiClientService.asyncLogin(
            userData.email,
            userData.secret_password
          );

          return this.http(originalConfig);
        }

        return Promise.reject(error);
      }
    );
  }
}
