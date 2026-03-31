import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveAuth } from '../../services/auth';
import { buildApiUrl } from '../../services/medicineService';
import { getDefaultRouteForRole } from '../../services/runtime';
import PasswordField from '../../components/PasswordField';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname.startsWith('/admin');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(buildApiUrl('/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          portal: isAdminLogin ? 'admin' : 'client',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        setError(data.message || 'Erreur de connexion');
        return;
      }

      if (isAdminLogin && data.role === 'client') {
        setError("Les comptes clients passent par l'interface web publique.");
        return;
      }

      saveAuth(data.token, data.role, data.user);
      navigate(getDefaultRouteForRole(data.role), { replace: true });
    } catch {
      setError('Erreur serveur');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-sm">
        <div>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            {isAdminLogin ? 'Connexion staff' : 'Connexion client'}
          </p>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
            {isAdminLogin ? "Acces a l'administration interne" : 'Connectez-vous a votre compte'}
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            {isAdminLogin
              ? 'Reserve aux administrateurs et pharmaciens utilisant la version desktop.'
              : 'Accedez a vos commandes, reservations et notifications privees.'}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 rounded-2xl">
            <input
              type="email"
              required
              className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Adresse email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <PasswordField
              required
              value={password}
              onChange={setPassword}
              placeholder="Mot de passe"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className={`flex w-full justify-center rounded-xl px-4 py-3 text-sm font-medium text-white ${
              isAdminLogin ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Se connecter
          </button>
        </form>
        {!isAdminLogin && (
          <div className="text-center text-sm">
            <a href="/register" className="text-blue-600 hover:underline">
              Pas de compte ? S&apos;inscrire
            </a>
          </div>
        )}
        <div className="text-center text-sm">
          <button type="button" onClick={() => navigate('/reset-password')} className="text-blue-600 hover:underline">
            Reinitialiser le mot de passe
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
