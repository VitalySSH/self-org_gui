import { UserInterface } from "./user.interface.ts";
import { UserModel } from "../../models";

export interface AuthContextProvider {
    user?: UserInterface;
    is2FAVerified?: boolean;
    login: (user: UserInterface) => void;
    logout: () => void;
    getUserRelation: () => UserModel;
}