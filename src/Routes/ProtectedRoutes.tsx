import React from 'react';
import Layout from '../components/Layout';
import ProtectedGuard from './ProtectedGuard';

const ProtectedRoutes: React.FC = () => {
  return (
    <ProtectedGuard>
      <Layout />
    </ProtectedGuard>
  );
};

export default ProtectedRoutes;
