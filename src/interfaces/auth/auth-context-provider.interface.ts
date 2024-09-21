import { UserInterface } from "./user.interface.ts";
import { UserModel } from "../../models";

export interface AuthContextProvider {
    user?: UserInterface;
    avatarUrl: string | null;
    is2FAVerified?: boolean;
    login: (user: UserInterface, toMainPage: boolean) => void;
    logout: () => void;
    getUserRelation: () => UserModel;
    changeFotoId: (fotoId: string | null) => void;
    changeAvatarUrl: (
        fotoId: string | undefined | null,
        base64: string | undefined
    ) => void;
}