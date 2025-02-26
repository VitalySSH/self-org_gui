import { useContext } from 'react';
import { AuthContext } from './const/hooks.const.ts';

export const useAuth = () => {
  return useContext(AuthContext);
};
