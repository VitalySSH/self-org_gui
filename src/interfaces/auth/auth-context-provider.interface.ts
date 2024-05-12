import { UserInterface } from "./user.interface.ts";

export interface AuthContextProviderInterface {
    user?: UserInterface;
    is2FAVerified?: boolean;
}