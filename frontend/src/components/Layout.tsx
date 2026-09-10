import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          ChurnGuard
        </Link>
        <div className="user">
          <span>{user?.email}</span>
          <button className="danger" onClick={logout}>
            Salir
          </button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </>
  );
}
