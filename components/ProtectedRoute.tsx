import React from 'react';
import { Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  session: Session | null;
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ session, children }) => {
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;