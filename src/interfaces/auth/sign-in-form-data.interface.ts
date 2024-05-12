export interface SignInFormDataInterface {
    email: string;
    password: string;
    hashed_password?: string;
    remember: boolean;
}