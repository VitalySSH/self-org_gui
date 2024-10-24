import axios, { AxiosInstance } from "axios";
import {
    UserCreateInterface,
    UserInterface,
    UserUpdateInterface
} from "../interfaces";
import { baseApiUrl } from "../config/configuration.ts";

class AuthApiClientService {

    http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: baseApiUrl,
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: true,
        });
    }

    login(email: string, secret_password: string) {
        return this.http.post<void>('/auth/login',
            { email: email, secret_password: secret_password});
    }
    async asyncLogin(email: string, secret_password: string) {
        return this.http.post<void>('/auth/login',
            { email: email, secret_password: secret_password}).then();
    }

    logout() {
        return this.http.post<void>('/auth/logout');
    }

    async getCurrentUser() {
        return this.http.get<UserInterface>('/auth/user/me')
            .then(r => { return r.data });
    }

    async createUser(data: UserCreateInterface) {
        return this.http.post<void>(
            '/auth/user', data,
            {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );
    }

    async updateUser(
        userId: string,data: UserUpdateInterface) {
        return this.http.patch<void>(
            `/auth/user/${userId}`, data,
            {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );
    }

}

export default new AuthApiClientService();