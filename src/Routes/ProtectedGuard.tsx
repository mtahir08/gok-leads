import React, { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useAuth } from '../Hooks/useAuth';

interface ProtectedGuardProps {
  children: ReactNode;
}

const ProtectedGuard: React.FC<ProtectedGuardProps> = ({ children }) => {
  const { auth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [, setCookie] = useCookies(['redirectUrl']);

  useEffect(() => {
    if (!auth) {
      setCookie('redirectUrl', location.pathname + location.search, { path: '/' });
      navigate('/');
    }
  }, [auth, location, setCookie, navigate]);

  return <>{children}</>;
};

export default ProtectedGuard;
