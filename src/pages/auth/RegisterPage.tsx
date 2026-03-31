import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../../services/medicineService';
import PasswordField from '../../components/PasswordField';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await axios.post(buildApiUrl('/register'), {
        email: email.trim().toLowerCase(),
        password,
        role: 'client',
      });
      setSuccess('Inscription reussie. Redirection vers la connexion...');
      window.setTimeout(() => navigate('/login'), 1500);
    } catch (requestError: unknown) {
      const errorMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(errorMessage ? `Erreur : ${errorMessage}` : 'Erreur serveur inattendue.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-sm">
        <div>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Compte Client</p>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">Creer votre compte web</h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            La creation des comptes staff reste reservee a l&apos;administration interne.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
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
              autoComplete="new-password"
            />
          </div>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
          <button
            type="submit"
            className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            S&apos;inscrire
          </button>
        </form>
        <div className="text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">
            Deja un compte ? Se connecter
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
