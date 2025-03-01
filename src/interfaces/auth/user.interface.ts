export interface UserInterface {
  id: string;
  firstname: string;
  surname: string;
  fullname: string;
  about_me: string | null;
  foto_id?: string | null;
  email: string;
  secret_password?: string;
}
