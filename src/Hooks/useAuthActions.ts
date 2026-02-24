import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { forcedResetPass, forgotPass, resetPass, signinUser } from '../api/auth';
import { IUser } from '../types';
import { useAuth } from './useAuth';

export function useAuthActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookies, setCookie, removeCookie] = useCookies([
    'accessToken',
    'user',
    'redirectUrl',
  ]);
  const { setAuth, setAccessToken } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setUserAndToken = useCallback(
    ({ user, token }: { user: IUser; token: string }) => {
      const redirectUrl = cookies.redirectUrl || '/documents';
      setAuth(user);
      setAccessToken(token);
      setCookie('accessToken', token, { path: '/' });
      setCookie('user', user, { path: '/' });
      setIsLoading(false);
      navigate(redirectUrl);
      removeCookie('redirectUrl');
    },
    [navigate, cookies.redirectUrl, setAccessToken, setAuth, setCookie, removeCookie],
  );

  const login = useCallback(
    async (obj: Partial<IUser>) => {
      try {
        setIsLoading(true);
        const response = await signinUser(obj);
        if (response?.token) {
          setUserAndToken({ user: response.user, token: response.token });
        } else if (response?.reset) {
          navigate('/reset');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          const { response } = error as any;
          if (response?.data?.reset) {
            navigate('/reset');
          }
          return { error: response?.data?.message };
        }
        return { error: 'An error occurred' };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setUserAndToken],
  );

  const forcedReset = useCallback(
    async (obj: Partial<IUser>) => {
      try {
        setIsLoading(true);
        const response = await forcedResetPass(obj);
        if (response?.token) {
          setUserAndToken({ user: response.user, token: response.token });
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          const { response } = error as any;
          return { error: response?.data?.message };
        }
        return { error: 'An error occurred' };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setUserAndToken],
  );

  const forgot = useCallback(
    async (obj: any) => {
      try {
        setIsLoading(true);
        const response = await forgotPass(obj);
        if (response?.status) {
          navigate('/reset-password');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          const { response } = error as any;
          return { error: response?.data?.message };
        }
        return { error: 'An error occurred' };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  const reset = useCallback(
    async (obj: any) => {
      try {
        setIsLoading(true);
        const response = await resetPass(obj);
        if (response?.status) {
          navigate('/');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          const { response } = error as any;
          return { error: response?.data?.message };
        }
        return { error: 'An error occurred' };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  const logout = useCallback(() => {
    queryClient.clear();
    queryClient.removeQueries();
    queryClient.resetQueries();
    removeCookie('accessToken');
    removeCookie('user');
    setAuth(null);
    setAccessToken('');
    navigate('/');
  }, [removeCookie, setAccessToken, setAuth, queryClient, navigate]);

  return useMemo(
    () => ({ login, logout, forcedReset, reset, forgot, isLoading }),
    [isLoading, login, logout, forcedReset, reset, forgot],
  );
}
