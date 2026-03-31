import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuth, getAuthRole } from '../services/auth';
import { getDefaultRouteForRole, isDesktopShell, type AppSection } from '../services/runtime';

interface HeaderProps {
  section: AppSection;
}

const Header: React.FC<HeaderProps> = ({ section }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getAuthRole();
  const desktop = isDesktopShell();

  const handleLogout = () => {
    clearAuth();
    navigate(section === 'admin' ? '/admin/login' : '/login');
  };

  const publicLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/products', label: 'Produits' },
  ];

  const clientLinks = role === 'client'
    ? [
        { to: '/client/dashboard', label: 'Espace client' },
        { to: '/client/demande', label: 'Disponibilite' },
        { to: '/client/commander', label: 'Commander' },
      ]
    : [];

  const adminLinks = role === 'admin'
    ? [
        { to: '/admin/dashboard', label: 'Tableau admin' },
        { to: '/admin/pharmacien', label: 'Stock et demandes' },
      ]
    : role === 'pharmacien'
      ? [{ to: '/admin/pharmacien', label: 'Tableau pharmacien' }]
      : [];

  const links = section === 'admin' ? adminLinks : [...publicLinks, ...clientLinks];

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              {section === 'admin' ? 'Desktop Admin' : desktop ? 'Client Web / Shell Desktop' : 'Client Web'}
            </p>
            <p className="text-lg font-bold text-slate-900">Gestion Pharmacies</p>
          </div>
          <div className="hidden h-8 w-px bg-slate-200 md:block" />
          <div className="flex flex-wrap items-center gap-2">
            {links.map((link) => {
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!role && section === 'admin' && (
            <Link to="/admin/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
              Connexion staff
            </Link>
          )}
          {!role && section === 'public' && (
            <Link to="/login" className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Connexion client
            </Link>
          )}
          {role && (
            <>
              <button
                type="button"
                onClick={() => navigate(getDefaultRouteForRole(role))}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Mon espace
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
              >
                Deconnexion
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
