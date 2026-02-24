import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';

interface PublicGuardProps {
  children: ReactNode;
}

const PublicGuard: React.FC<PublicGuardProps> = ({ children }) => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      navigate('/documents');
    }
  }, [accessToken, navigate]);

  return <>{children}</>;
};

export default PublicGuard;
