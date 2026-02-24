import { useContext } from 'react';
import { AuthContext } from '../Providers/Auth.Provider';

export const useAuth = () => useContext(AuthContext);
