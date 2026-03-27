import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { Medicine } from '../types/Medicine';
import type { PharmacyRequest } from '../types/PharmacyRequest';
import { API_BASE_URL } from '../services/medicineService';

interface PharmacienDashboardProps {
  onMedicamentsChanged: () => void;
}

const initialFormState = {
  name: '',
  quantity: 0,
  price: 0,
  category: 'ordonnance' as Medicine['category'],
  therapeuticClass: 'antipaludique' as Medicine['therapeuticClass'],
  healthSystemClass: 'cardiovasculaire' as Medicine['healthSystemClass'],
  form: 'comprime' as Medicine['form'],
  image: null as File | null,
  alternatives: [] as string[],
};

const PharmacienDashboard: React.FC<PharmacienDashboardProps> = ({ onMedicamentsChanged }) => {
  const [medicaments, setMedicaments] = useState<Medicine[]>([]);
  const [requests, setRequests] = useState<PharmacyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMedicament, setSelectedMedicament] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const newRequestsCount = useMemo(
    () => requests.filter((request) => request.status === 'nouveau').length,
    [requests],
  );

  useEffect(() => {
    void Promise.all([fetchMedicaments(), fetchRequests()]);

    const intervalId = window.setInterval(() => {
      void fetchRequests();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const fetchMedicaments = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.get<Medicine[]>(`${API_BASE_URL}/medicaments`);
      setMedicaments(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des medicaments');
      console.error('Erreur lors de la recuperation des medicaments :', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);

    try {
      const res = await axios.get<PharmacyRequest[]>(`${API_BASE_URL}/pharmacy-requests`);
      setRequests(res.data);
    } catch (err) {
      console.error('Erreur lors de la recuperation des demandes pharmacie :', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'image' && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0] ?? null;
      setFormData((current) => ({ ...current, image: file }));
      return;
    }

    if (name === 'quantity' || name === 'price') {
      setFormData((current) => ({ ...current, [name]: Number(value) }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedMedicament(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('quantity', formData.quantity.toString());
      data.append('price', formData.price.toString());
      data.append('category', formData.category);
      data.append('therapeuticClass', formData.therapeuticClass);
      data.append('healthSystemClass', formData.healthSystemClass);
      data.append('form', formData.form);

      if (formData.image) {
        data.append('image', formData.image);
      }

      data.append('alternatives', formData.alternatives.join(','));

      if (selectedMedicament) {
        await axios.put(`${API_BASE_URL}/medicaments/${selectedMedicament._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Produit mis a jour avec succes.');
      } else {
        await axios.post(`${API_BASE_URL}/medicaments`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Produit ajoute avec succes.');
      }

      await fetchMedicaments();
      onMedicamentsChanged();
      resetForm();
    } catch (err) {
      console.error("Erreur lors de l'ajout ou de la mise a jour du medicament :", err);
      setError("Erreur lors de l'ajout ou de la mise a jour du medicament");
    }
  };

  const handleEdit = (medicament: Medicine) => {
    setSelectedMedicament(medicament);
    setSuccess('');
    setError('');
    setFormData({
      name: medicament.name,
      quantity: medicament.quantity,
      price: medicament.price,
      category: medicament.category,
      therapeuticClass: medicament.therapeuticClass,
      healthSystemClass: medicament.healthSystemClass,
      form: medicament.form,
      image: null,
      alternatives: medicament.alternatives?.map((alt) => alt._id) ?? [],
    });
  };

  const handleDelete = async (id: string) => {
    setError('');
    setSuccess('');

    try {
      await axios.delete(`${API_BASE_URL}/medicaments/${id}`);
      await fetchMedicaments();
      onMedicamentsChanged();
      setSuccess('Produit supprime avec succes.');
    } catch (err) {
      console.error('Erreur lors de la suppression du medicament :', err);
      setError('Erreur lors de la suppression du medicament');
    }
  };

  const updateRequestStatus = async (id: string, status: PharmacyRequest['status']) => {
    try {
      await axios.patch(`${API_BASE_URL}/pharmacy-requests/${id}`, { status });
      await fetchRequests();
    } catch (err) {
      console.error('Erreur lors de la mise a jour du statut de la demande :', err);
      setError('Erreur lors de la mise a jour de la demande');
    }
  };

  const scrollToRequests = () => {
    const requestsSection = document.getElementById('pharmacy-requests-section');
    requestsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord Pharmacien</h1>
          <p className="text-sm text-gray-600">
            Le stock est gere par le champ quantite de chaque medicament.
          </p>
        </div>
        <button
          type="button"
          onClick={scrollToRequests}
          className="relative rounded-full transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Voir les notifications et demandes clients"
        >
          <img
            src="/notification"
            alt="Notifications"
            className="h-12 w-12 rounded-full bg-white object-cover p-1 shadow-sm"
          />
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {newRequestsCount}
          </span>
        </button>
      </div>

      {loading && <p>Chargement des donnees...</p>}
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}

      <section id="pharmacy-requests-section" className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Reservations et commandes clients</h2>
            <p className="text-sm text-slate-500">
              Toutes les commandes, reservations et demandes de disponibilite remontent ici.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchRequests()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Actualiser
          </button>
        </div>

        {newRequestsCount > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Notification: {newRequestsCount} nouvelle(s) demande(s) en attente de lecture.
          </div>
        )}

        {requestsLoading ? (
          <div className="py-6 text-slate-500">Chargement des demandes...</div>
        ) : requests.length === 0 ? (
          <div className="py-6 text-slate-500">Aucune reservation ou commande pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2 text-left">Type</th>
                  <th className="border px-4 py-2 text-left">Medicament</th>
                  <th className="border px-4 py-2 text-left">Quantite</th>
                  <th className="border px-4 py-2 text-left">Contact</th>
                  <th className="border px-4 py-2 text-left">Date</th>
                  <th className="border px-4 py-2 text-left">Statut</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} className={request.status === 'nouveau' ? 'bg-red-50' : ''}>
                    <td className="border px-4 py-2">{formatRequestType(request.type)}</td>
                    <td className="border px-4 py-2">{request.medicationName}</td>
                    <td className="border px-4 py-2">{request.quantity}</td>
                    <td className="border px-4 py-2">{request.contact}</td>
                    <td className="border px-4 py-2">
                      {request.requestedDate || new Date(request.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="border px-4 py-2">{formatRequestStatus(request.status)}</td>
                    <td className="border px-4 py-2">
                      {request.status === 'nouveau' && (
                        <button
                          type="button"
                          onClick={() => void updateRequestStatus(request._id, 'vu')}
                          className="mr-2 rounded bg-amber-500 px-2 py-1 text-white"
                        >
                          Marquer vu
                        </button>
                      )}
                      {request.status !== 'traite' && (
                        <button
                          type="button"
                          onClick={() => void updateRequestStatus(request._id, 'traite')}
                          className="rounded bg-green-600 px-2 py-1 text-white"
                        >
                          Traiter
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-3">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom" required />
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantite" required />
        <div className="flex items-center overflow-hidden rounded border border-gray-300">
          <input
            type="number"
            name="price"
            min="0"
            step="1"
            value={formData.price}
            onChange={handleChange}
            placeholder="Prix"
            className="w-full px-3 py-2 outline-none"
            required
          />
          <span className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">XAF</span>
        </div>
        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="ordonnance">Ordonnance</option>
          <option value="vente_libre">Vente libre</option>
          <option value="specialise">Specialise</option>
          <option value="produit_sante">Produit de sante</option>
        </select>
        <select name="therapeuticClass" value={formData.therapeuticClass} onChange={handleChange} required>
          <option value="antipaludique">Antipaludique</option>
          <option value="antitussif">Antitussif</option>
          <option value="antiinflammatoire">Anti-inflammatoire</option>
          <option value="analgesique">Analgesique</option>
          <option value="autre">Autre</option>
        </select>
        <select name="healthSystemClass" value={formData.healthSystemClass} onChange={handleChange} required>
          <option value="cardiovasculaire">Cardiovasculaire</option>
          <option value="antibiotique">Antibiotique</option>
          <option value="autre">Autre</option>
        </select>
        <select name="form" value={formData.form} onChange={handleChange} required>
          <option value="comprime">Comprime</option>
          <option value="sirop">Sirop</option>
          <option value="injection">Injection</option>
          <option value="autre">Autre</option>
        </select>
        <input type="file" name="image" onChange={handleChange} accept="image/*" />
        <button type="submit" className="bg-blue-500 p-2 text-white">
          {selectedMedicament ? 'Mettre a jour' : 'Ajouter'}
        </button>
      </form>

      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nom</th>
            <th className="border px-4 py-2">Quantite</th>
            <th className="border px-4 py-2">Prix</th>
            <th className="border px-4 py-2">Categorie</th>
            <th className="border px-4 py-2">Classe therapeutique</th>
            <th className="border px-4 py-2">Classe systeme de sante</th>
            <th className="border px-4 py-2">Forme</th>
            <th className="border px-4 py-2">Image</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicaments.length > 0 ? (
            medicaments.map((med) => (
              <tr key={med._id}>
                <td className="border px-4 py-2">{med.name}</td>
                <td className="border px-4 py-2">{med.quantity}</td>
                <td className="border px-4 py-2">{formatPrice(med.price)}</td>
                <td className="border px-4 py-2">{med.category}</td>
                <td className="border px-4 py-2">{med.therapeuticClass}</td>
                <td className="border px-4 py-2">{med.healthSystemClass}</td>
                <td className="border px-4 py-2">{med.form}</td>
                <td className="border px-4 py-2">
                  {med.imageUrl ? <img src={resolveMedicamentImage(med.imageUrl)} alt={med.name} className="h-16 w-16 object-cover" /> : '-'}
                </td>
                <td className="border px-4 py-2">
                  <button onClick={() => handleEdit(med)} className="mr-2 bg-yellow-500 p-1 text-white">
                    Editer
                  </button>
                  <button onClick={() => void handleDelete(med._id)} className="bg-red-500 p-1 text-white">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="border px-4 py-2 text-center">Aucun medicament trouve</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const resolveMedicamentImage = (imageUrl: string): string =>
  imageUrl.startsWith('http') || imageUrl.startsWith('/uploads/')
    ? imageUrl.startsWith('http')
      ? imageUrl
      : `${API_BASE_URL}${imageUrl}`
    : imageUrl;

const formatPrice = (price: number): string => `${price.toLocaleString('fr-FR')} XAF`;

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

export default PharmacienDashboard;
