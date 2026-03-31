import React, { useEffect, useMemo, useState } from 'react';
import { buildApiUrl } from '../services/medicineService';
import { getAuthHeaders, getStoredUser } from '../services/auth';
import type { PharmacyRequest } from '../types/PharmacyRequest';

const ClientDashboard: React.FC = () => {
  const [requests, setRequests] = useState<PharmacyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getStoredUser();

  const unreadResponsesCount = useMemo(
    () => requests.filter((request) => request.clientNotification?.isUnread && request.pharmacistResponse?.message).length,
    [requests],
  );

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl('/my-pharmacy-requests'), {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Impossible de charger vos demandes.');
        return;
      }

      setRequests(data);
    } catch {
      setError('Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (requestId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/my-pharmacy-requests/${requestId}/read`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Impossible de marquer la notification comme lue.');
        return;
      }

      setRequests((current) => current.map((request) => (request._id === requestId ? data : request)));
    } catch {
      setError('Erreur serveur.');
    }
  };

  useEffect(() => {
    void fetchRequests();

    const intervalId = window.setInterval(() => {
      void fetchRequests();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Espace client prive</h1>
        <p className="mt-2 text-sm text-slate-600">
          {user?.email ? `Connecte en tant que ${user.email}.` : 'Suivez ici vos demandes et les retours du pharmacien.'}
        </p>
        <div className="mt-4 inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          {unreadResponsesCount} notification(s) non lue(s)
        </div>
      </div>

      {loading && <p>Chargement de vos demandes...</p>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      {!loading && requests.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Aucune demande privee enregistree pour le moment.
        </div>
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <article key={request._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {formatRequestType(request.type)} - {request.medicationName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cree le {new Date(request.createdAt).toLocaleString('fr-FR')} | Statut: {formatRequestStatus(request.status)}
                </p>
              </div>
              {request.clientNotification?.isUnread && request.pharmacistResponse?.message && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Nouvelle reponse</span>
              )}
            </div>

            <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <div>
                <dt className="font-semibold">Quantite</dt>
                <dd>{request.quantity}</dd>
              </div>
              <div>
                <dt className="font-semibold">Contact</dt>
                <dd>{request.contact}</dd>
              </div>
              {request.requestedDate && (
                <div>
                  <dt className="font-semibold">Date souhaitee</dt>
                  <dd>{request.requestedDate}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Retour du pharmacien</p>
              {request.pharmacistResponse?.message ? (
                <>
                  <p className="mt-2 text-sm text-slate-700">{request.pharmacistResponse.message}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Repondu le{' '}
                    {request.pharmacistResponse.respondedAt
                      ? new Date(request.pharmacistResponse.respondedAt).toLocaleString('fr-FR')
                      : 'date inconnue'}
                  </p>
                  {request.clientNotification?.isUnread && (
                    <button
                      type="button"
                      onClick={() => void markNotificationAsRead(request._id)}
                      className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Marquer comme lu
                    </button>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Aucune reponse du pharmacien pour le moment.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const formatRequestType = (type: PharmacyRequest['type']): string => {
  if (type === 'commande') return 'Commande';
  if (type === 'reservation') return 'Reservation';
  return 'Disponibilite';
};

const formatRequestStatus = (status: PharmacyRequest['status']): string => {
  if (status === 'nouveau') return 'Nouveau';
  if (status === 'vu') return 'Vu';
  return 'Traite';
};

export default ClientDashboard;
