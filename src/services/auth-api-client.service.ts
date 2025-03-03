import axios, { AxiosInstance } from 'axios';
import {
  CrudApiListResponse,
  ListResponse,
  Pagination,
  UserCreateInterface,
  UserCreateResponse,
  UserInterface,
  UserUpdateInterface,
} from 'src/interfaces';
import { baseApiUrl } from 'src/config/configuration';
import { Filters, Orders } from 'src/shared/types.ts';
import { UserModel } from 'src/models';

export class AuthApiClientService {
  http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: baseApiUrl,
      headers: {
        accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      withCredentials: true,
    });
  }

  login(email: string, secret_password: string) {
    return this.http.post<void>('/auth/login', {
      email: email,
      secret_password: secret_password,
    });
  }
  async asyncLogin(email: string, secret_password: string) {
    return this.http
      .post<void>('/auth/login', {
        email: email,
        secret_password: secret_password,
      })
      .then();
  }

  logout() {
    return this.http.post<void>('/auth/logout');
  }

  async getCurrentUser() {
    return this.http.get<UserInterface>('/auth/user/me').then((r) => {
      return r.data;
    });
  }

  async listUsers(
    filters?: Filters,
    orders?: Orders,
    pagination?: Pagination,
    include?: string[]
  ): Promise<ListResponse<UserModel>> {
    const data = {
      filters,
      orders,
      pagination,
      include,
    };

    return this.http
      .post<CrudApiListResponse>('/auth/user/list', data, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then((r) => {
        const data = r.data.items as unknown as UserModel[];

        return { data, total: r.data.total };
      });
  }

  async communityListUsers(
    community_id: string,
    filters?: Filters,
    orders?: Orders,
    pagination?: Pagination,
    include?: string[],
    is_delegates: boolean = false
  ): Promise<ListResponse<UserModel>> {
    const data = {
      filters,
      orders,
      pagination,
      include,
      is_delegates,
    };
    const url = `/auth/user/list/${community_id}`;

    return this.http
      .post<CrudApiListResponse>(url, data, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then((r) => {
        const data = r.data.items as unknown as UserModel[];

        return { data, total: r.data.total };
      });
  }

  async createUser(data: UserCreateInterface) {
    return this.http
      .post<UserCreateResponse>('/auth/user', data, {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then((r) => r.data);
  }

  async updateUser(userId: string | undefined, data: UserUpdateInterface) {
    return this.http.patch<void>(`/auth/user/${userId}`, data, {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }
}
