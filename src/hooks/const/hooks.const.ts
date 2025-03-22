import { createContext } from 'react';
import { AuthContextProvider } from 'src/interfaces';

export const AuthContext = createContext({} as AuthContextProvider);
