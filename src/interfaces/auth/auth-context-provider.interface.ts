import { UserInterface } from "./user.interface.ts";

export interface AuthContextProvider {
    user?: UserInterface;
    is2FAVerified?: boolean;
    login?: (user: UserInterface) => void;
    logout?: () => void;
}