export interface UserInterface {
  id: string;
  firstname: string;
  surname: string;
  about_me: string;
  foto_id?: string | null;
  email: string;
  secret_password?: string;
}
