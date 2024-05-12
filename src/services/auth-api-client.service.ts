import axios, { AxiosInstance } from "axios";
import { UserInterface } from "../interfaces";

class AuthApiClientService {

    http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: 'http://localhost:8080/api/v1',
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: true,
        });
    }

    login(email: string, hashed_password: string) {
        return this.http.post<void>('/auth/login',
            { email: email, hashed_password: hashed_password});
    }
    async asyncLogin(email: string, hashed_password: string) {
        return this.http.post<void>('/auth/login',
            { email: email, hashed_password: hashed_password}).then();
    }

    logout() {
        return this.http.post<void>('/auth/logout');
    }

    async getCurrentUser() {
        return this.http.get<UserInterface>('/auth/user')
            .then(r => { return r.data });
    }

}

export default new AuthApiClientService();