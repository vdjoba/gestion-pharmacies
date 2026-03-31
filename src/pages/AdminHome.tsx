import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthRole, getStoredUser } from '../services/auth';
import { isDesktopShell } from '../services/runtime';

const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const role = getAuthRole();
  const user = getStoredUser();
  const [updateStatus, setUpdateStatus] = useState('Canal desktop pret.');

  useEffect(() => {
    if (!window.electronAPI?.onUpdateStatus) {
      return;
    }

    const unsubscribe = window.electronAPI.onUpdateStatus((message) => {
      setUpdateStatus(message);
    });

    return unsubscribe;
  }, []);

  const handleCheckUpdates = async () => {
    if (!window.electronAPI?.checkForUpdates) {
      setUpdateStatus('Verification disponible uniquement dans la version desktop.');
      return;
    }

    await window.electronAPI.checkForUpdates();
  };

  const actions = [
    {
      title: 'Tableau administrateur',
      description: 'Gerer les comptes, les roles et les indicateurs globaux.',
      path: '/admin/dashboard',
      visible: role === 'admin',
      tone: 'bg-slate-900 text-white',
    },
    {
      title: 'Stock et demandes',
      description: 'Traiter les demandes clients et administrer le stock.',
      path: '/admin/pharmacien',
      visible: role === 'admin' || role === 'pharmacien',
      tone: 'bg-emerald-600 text-white',
    },
    {
      title: 'Catalogue interne',
      description: 'Consulter rapidement la liste des produits cote administration.',
      path: '/product-list',
      visible: role === 'admin' || role === 'pharmacien',
      tone: 'bg-white text-slate-900 border border-slate-200',
    },
  ].filter((action) => action.visible);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              {isDesktopShell() ? 'Accueil Desktop' : 'Administration Interne'}
            </p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">Espace interne pharmacie</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              {user?.email ? `Session active : ${user.email}.` : 'Choisissez un module de travail pour continuer.'}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-5 py-4 text-sm text-slate-600">
            Role actif : <span className="font-semibold text-slate-900">{role || 'inconnu'}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {actions.map((action) => (
            <button
              key={action.path}
              type="button"
              onClick={() => navigate(action.path)}
              className={`rounded-3xl p-6 text-left shadow-sm transition hover:-translate-y-1 ${action.tone}`}
            >
              <h2 className="text-2xl font-semibold">{action.title}</h2>
              <p className="mt-3 text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Mises a jour desktop</p>
            <p className="mt-2 text-sm text-slate-700">{updateStatus}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleCheckUpdates()}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Verifier maintenant
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminHome;
