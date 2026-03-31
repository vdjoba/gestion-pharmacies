import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDefaultRouteForRole } from '../services/runtime';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  useEffect(() => {
    if (role === 'admin' || role === 'pharmacien') {
      navigate(getDefaultRouteForRole(role), { replace: true });
    }
  }, [navigate, role]);

  const quickActions = [
    {
      title: 'Verifier la disponibilite',
      description: 'Rechercher un medicament et recevoir un retour de la pharmacie.',
      className: 'bg-emerald-600 hover:bg-emerald-700',
      path: '/client/demande',
    },
    {
      title: 'Commander',
      description: 'Envoyer une commande client via le portail web.',
      className: 'bg-blue-600 hover:bg-blue-700',
      path: '/client/commander',
    },
    {
      title: 'Reserver',
      description: 'Bloquer un produit avant votre passage en pharmacie.',
      className: 'bg-amber-500 hover:bg-amber-600',
      path: '/client/reserver',
    },
    {
      title: 'Soumettre une ordonnance',
      description: 'Transmettre une ordonnance pour traitement par le pharmacien.',
      className: 'bg-fuchsia-600 hover:bg-fuchsia-700',
      path: '/client/ordonnance',
    },
  ];

  if (role === 'client') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Portail Client</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">Bienvenue dans votre espace pharmacie</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Accedez a vos demandes, commandes et retours du pharmacien depuis le portail web.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/client/dashboard')}
              className="rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
            >
              Ouvrir mon espace prive
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.path}
                type="button"
                onClick={() => navigate(action.path)}
                className={`rounded-2xl p-6 text-left text-white shadow-sm transition ${action.className}`}
              >
                <h2 className="text-xl font-semibold">{action.title}</h2>
                <p className="mt-2 text-sm text-white/90">{action.description}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Portail Web Clients</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Pharmacie Internationale de PK14</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Cette interface est reservee aux clients finaux. L&apos;administration interne fonctionne dans l&apos;application desktop.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {quickActions.map((action) => (
            <button
              key={action.path}
              type="button"
              onClick={() => navigate(action.path)}
              className={`rounded-2xl p-6 text-left text-white shadow-sm transition ${action.className}`}
            >
              <h2 className="text-xl font-semibold">{action.title}</h2>
              <p className="mt-2 text-sm text-white/90">{action.description}</p>
            </button>
          ))}
        </div>
      </section>

      <aside className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Acces interne</p>
        <h2 className="mt-4 text-3xl font-bold">Administration desktop</h2>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Le personnel de la pharmacie utilise une application desktop distincte pour le stock, les demandes clients et la gestion des comptes.
        </p>
        <div className="mt-8 rounded-2xl bg-white/10 p-5">
          <p className="text-sm text-slate-200">Usage recommande</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Clients finaux : site web public</li>
            <li>Pharmaciens : application desktop interne</li>
            <li>Administrateurs : application desktop interne</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/login')}
          className="mt-8 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
        >
          Acces staff
        </button>
      </aside>
    </div>
  );
};

export default Home;
