import { UserInterface } from "src/interfaces";

export class CurrentUserService {

    public static set(user: UserInterface) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    public static get user(): UserInterface | undefined {
        const currentUser = localStorage.getItem('user')

        return currentUser ? JSON.parse(currentUser) : undefined;
    }

    public static remove() {
        localStorage.removeItem('user');
    }
}
