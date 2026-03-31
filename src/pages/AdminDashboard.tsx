import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/medicineService';
import { getAuthHeaders } from '../services/auth';
import PasswordField from '../components/PasswordField';

type UserRole = 'admin' | 'pharmacien' | 'client';

interface AdminUser {
  _id: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface AdminStats {
  users: {
    total: number;
    admins: number;
    pharmaciens: number;
    clients: number;
    others: number;
  };
  medicaments: {
    total: number;
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    stockValue: number;
  };
}

interface UserFormState {
  email: string;
  password: string;
  role: UserRole;
}

const emptyForm: UserFormState = {
  email: '',
  password: '',
  role: 'client',
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  pharmacien: 'Pharmacien',
  client: 'Client',
};

const getApiErrorMessage = (requestError: unknown) =>
  (requestError as { response?: { data?: { message?: string } } }).response?.data?.message || '';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('role') === 'admin';
  const authHeaders = getAuthHeaders();

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email)),
    [users],
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersResponse, statsResponse] = await Promise.all([
        axios.get<AdminUser[]>(`${API_BASE_URL}/admin/users`, { headers: authHeaders }),
        axios.get<AdminStats>(`${API_BASE_URL}/admin/stats`, { headers: authHeaders }),
      ]);

      setUsers(usersResponse.data);
      setStats(statsResponse.data);
    } catch (requestError) {
      console.error('Erreur lors du chargement du tableau de bord admin:', requestError);
      setError('Impossible de charger les donnees administrateur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingUserId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    };

    try {
      if (editingUserId) {
        await axios.put(`${API_BASE_URL}/admin/users/${editingUserId}`, payload, { headers: authHeaders });
        setSuccess('Utilisateur mis a jour.');
      } else {
        await axios.post(`${API_BASE_URL}/admin/users`, payload, { headers: authHeaders });
        setSuccess('Utilisateur ajoute.');
      }

      resetForm();
      await fetchDashboardData();
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError) || 'Operation impossible pour le moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    const role = ['admin', 'pharmacien', 'client'].includes(user.role) ? (user.role as UserRole) : 'client';

    setEditingUserId(user._id);
    setForm({
      email: user.email,
      password: '',
      role,
    });
    setSuccess('');
    setError('');
  };

  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm(`Supprimer l'utilisateur ${user.email} ?`);
    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${user._id}`, { headers: authHeaders });

      if (editingUserId === user._id) {
        resetForm();
      }

      setSuccess('Utilisateur supprime.');
      await fetchDashboardData();
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError) || 'Suppression impossible pour le moment.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Cette page est reservee aux administrateurs connectes.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord Administrateur</h1>
        <p className="mt-2 text-slate-600">
          Gerer les comptes et suivre l&apos;etat global de la pharmacie.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          {success}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Utilisateurs</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats?.users.total ?? '--'}</p>
          <p className="mt-2 text-sm text-slate-600">
            {stats ? `${stats.users.admins} admins, ${stats.users.pharmaciens} pharmaciens` : 'Chargement'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Medicaments references</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats?.medicaments.total ?? '--'}</p>
          <p className="mt-2 text-sm text-slate-600">
            {stats ? `${stats.medicaments.totalStock} unites en stock` : 'Chargement'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Alertes stock faible</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{stats?.medicaments.lowStockCount ?? '--'}</p>
          <p className="mt-2 text-sm text-slate-600">
            {stats ? `${stats.medicaments.outOfStockCount} ruptures` : 'Chargement'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Valeur du stock</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {stats ? `${stats.medicaments.stockValue.toLocaleString('fr-FR')} FCFA` : '--'}
          </p>
          <p className="mt-2 text-sm text-slate-600">Estimation basee sur quantite x prix.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingUserId ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
            </h2>
            {editingUserId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Annuler
              </button>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="admin@pharmacie.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="admin-password">
                {editingUserId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
              </label>
              <PasswordField
                id="admin-password"
                required={!editingUserId}
                value={form.password}
                onChange={(value) => setForm((current) => ({ ...current, password: value }))}
                placeholder={editingUserId ? 'Laisser vide pour conserver le mot de passe actuel' : 'Mot de passe'}
                autoComplete={editingUserId ? 'new-password' : 'new-password'}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="admin-role">
                Role
              </label>
              <select
                id="admin-role"
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value="client">Client</option>
                <option value="pharmacien">Pharmacien</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting ? 'Enregistrement...' : editingUserId ? 'Mettre a jour' : 'Ajouter'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Gestion des utilisateurs</h2>
              <p className="text-sm text-slate-500">Creation, modification de role et suppression.</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchDashboardData()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-slate-500">
              Chargement des donnees...
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-slate-500">
              Aucun utilisateur enregistre.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 pr-4 font-medium">Cree le</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedUsers.map((user) => (
                    <tr key={user._id} className="text-sm text-slate-700">
                      <td className="py-4 pr-4">{user.email}</td>
                      <td className="py-4 pr-4">{roleLabels[user.role as UserRole] || user.role}</td>
                      <td className="py-4 pr-4">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="mr-3 font-medium text-blue-600 hover:text-blue-800"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(user)}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
