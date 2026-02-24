import React from 'react';
import { useCookies } from 'react-cookie';
import { fetchMyPermissions } from '../api/permission';
import { IUser, PROPS, UserRole } from '../types';

const EMPTY_SET = new Set<string>();

export const AuthContext = React.createContext<{
  auth: IUser | null;
  setAuth: React.Dispatch<React.SetStateAction<IUser | null>>;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  accessToken: string | null;
  isAdmin: boolean;
  permissions: Set<string>;
  permissionsLoaded: boolean;
  can: (...perms: string[]) => boolean;
  canAny: (...perms: string[]) => boolean;
}>({
  auth: null,
  setAuth: () => {},
  accessToken: null,
  setAccessToken: () => {},
  isAdmin: false,
  permissions: EMPTY_SET,
  permissionsLoaded: false,
  can: () => false,
  canAny: () => false,
});

const AuthProvider: React.FC<PROPS> = ({ children }) => {
  const [cookies] = useCookies(['accessToken', 'user']);

  const [auth, setAuth] = React.useState<IUser | null>(cookies.user || null);
  const [accessToken, setAccessToken] = React.useState<string | null>(
    cookies.accessToken || null,
  );
  const [permissions, setPermissions] = React.useState<Set<string>>(EMPTY_SET);
  const [permissionsLoaded, setPermissionsLoaded] = React.useState(false);

  const isAdmin = auth?.role === UserRole.Admin;

  React.useEffect(() => {
    if (!auth || !accessToken) {
      setPermissions(EMPTY_SET);
      setPermissionsLoaded(false);
      return;
    }

    let cancelled = false;
    fetchMyPermissions()
      .then((perms) => {
        if (!cancelled) {
          setPermissions(new Set(perms));
          setPermissionsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPermissionsLoaded(true);
        }
      });

    return () => { cancelled = true; };
  }, [auth?._id, accessToken]);

  const can = React.useCallback(
    (...perms: string[]) => perms.every((p) => permissions.has(p)),
    [permissions],
  );

  const canAny = React.useCallback(
    (...perms: string[]) => perms.some((p) => permissions.has(p)),
    [permissions],
  );

  const contextValue = React.useMemo(
    () => ({
      auth,
      setAuth,
      accessToken,
      setAccessToken,
      isAdmin,
      permissions,
      permissionsLoaded,
      can,
      canAny,
    }),
    [auth, accessToken, isAdmin, permissions, permissionsLoaded, can, canAny],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
