export interface SignUpFormDataInterface {
  firstname: string;
  surname: string;
  about_me?: string;
  email: string;
  password: string;
  confirm_password?: string;
  secret_password?: string;
  agreement?: boolean;
}
