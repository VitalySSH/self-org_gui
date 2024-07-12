import { createContext } from "react";
import { AuthContextProvider } from "../../interfaces";

export const AuthContext =
    createContext({} as AuthContextProvider);