import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { Medicine } from '../types/Medicine';
import type { PharmacyRequest } from '../types/PharmacyRequest';
import { getAuthHeaders } from '../services/auth';
import { API_BASE_URL } from '../services/medicineService';
import { medicineCatalog, type CatalogMedicineTemplate } from '../data/medicineCatalog';

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
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});
  const [catalogQuery, setCatalogQuery] = useState('');

  const authHeaders = getAuthHeaders();

  const newRequestsCount = useMemo(
    () => requests.filter((request) => request.status === 'nouveau').length,
    [requests],
  );

  const catalogOptions = useMemo(() => {
    const merged = new Map<string, CatalogMedicineTemplate>();

    medicineCatalog.forEach((item) => {
      merged.set(normalizeMedicineName(item.name), item);
    });

    medicaments.forEach((item) => {
      merged.set(normalizeMedicineName(item.name), {
        name: item.name,
        category: item.category,
        therapeuticClass: item.therapeuticClass,
        healthSystemClass: item.healthSystemClass,
        form: item.form,
        defaultPrice: item.price,
      });
    });

    return Array.from(merged.values()).sort((left, right) => left.name.localeCompare(right.name, 'fr'));
  }, [medicaments]);

  const filteredCatalogOptions = useMemo(() => {
    const query = normalizeMedicineName(catalogQuery);

    if (!query) {
      return catalogOptions.slice(0, 8);
    }

    return catalogOptions.filter((item) => normalizeMedicineName(item.name).includes(query)).slice(0, 8);
  }, [catalogOptions, catalogQuery]);

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
      const res = await axios.get<PharmacyRequest[]>(`${API_BASE_URL}/pharmacy-requests`, {
        headers: authHeaders,
      });
      setRequests(res.data);
      setResponseDrafts((current) => {
        const nextDrafts = { ...current };
        res.data.forEach((request) => {
          if (!(request._id in nextDrafts)) {
            nextDrafts[request._id] = '';
          }
        });
        return nextDrafts;
      });
    } catch (err) {
      console.error('Erreur lors de la recuperation des demandes pharmacie :', err);
      setError('Erreur lors du chargement des demandes clients');
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

  const applyTemplate = (template: CatalogMedicineTemplate) => {
    const existingMedicine = medicaments.find(
      (item) => normalizeMedicineName(item.name) === normalizeMedicineName(template.name),
    );

    if (existingMedicine) {
      setSelectedMedicament(existingMedicine);
      setFormData({
        name: existingMedicine.name,
        quantity: 0,
        price: existingMedicine.price,
        category: existingMedicine.category,
        therapeuticClass: existingMedicine.therapeuticClass,
        healthSystemClass: existingMedicine.healthSystemClass,
        form: existingMedicine.form,
        image: null,
        alternatives: existingMedicine.alternatives?.map((alt) => alt._id) ?? [],
      });
      setSuccess(`Medicament existant detecte: ${existingMedicine.name}. Saisissez la quantite a ajouter au stock.`);
      setError('');
      return;
    }

    setSelectedMedicament(null);
    setFormData((current) => ({
      ...current,
      name: template.name,
      price: template.defaultPrice,
      category: template.category,
      therapeuticClass: template.therapeuticClass,
      healthSystemClass: template.healthSystemClass,
      form: template.form,
    }));
    setSuccess(`Modele charge: ${template.name}. Completez la quantite puis ajoutez au stock.`);
    setError('');
  };

  const handleCatalogSelection = (value: string) => {
    setCatalogQuery(value);

    const selectedTemplate = catalogOptions.find(
      (item) => normalizeMedicineName(item.name) === normalizeMedicineName(value),
    );

    if (selectedTemplate) {
      applyTemplate(selectedTemplate);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedMedicament(null);
    setCatalogQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (formData.quantity <= 0) {
        setError('La quantite a ajouter au stock doit etre superieure a zero.');
        return;
      }

      const data = new FormData();
      data.append('name', formData.name);
      const existingMedicine = selectedMedicament ?? medicaments.find(
        (item) => normalizeMedicineName(item.name) === normalizeMedicineName(formData.name),
      );
      const nextQuantity = existingMedicine ? existingMedicine.quantity + formData.quantity : formData.quantity;

      data.append('quantity', nextQuantity.toString());
      data.append('price', formData.price.toString());
      data.append('category', formData.category);
      data.append('therapeuticClass', formData.therapeuticClass);
      data.append('healthSystemClass', formData.healthSystemClass);
      data.append('form', formData.form);

      if (formData.image) {
        data.append('image', formData.image);
      }

      data.append('alternatives', formData.alternatives.join(','));

      if (existingMedicine) {
        await axios.put(`${API_BASE_URL}/medicaments/${existingMedicine._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data', ...authHeaders },
        });
        setSuccess(`Stock mis a jour avec succes pour ${existingMedicine.name}.`);
      } else {
        await axios.post(`${API_BASE_URL}/medicaments`, data, {
          headers: { 'Content-Type': 'multipart/form-data', ...authHeaders },
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
      await axios.delete(`${API_BASE_URL}/medicaments/${id}`, {
        headers: authHeaders,
      });
      await fetchMedicaments();
      onMedicamentsChanged();
      setSuccess('Produit supprime avec succes.');
    } catch (err) {
      console.error('Erreur lors de la suppression du medicament :', err);
      setError('Erreur lors de la suppression du medicament');
    }
  };

  const updateRequest = async (id: string, payload: { status?: PharmacyRequest['status']; pharmacistMessage?: string }) => {
    try {
      await axios.patch(`${API_BASE_URL}/pharmacy-requests/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });
      await fetchRequests();
    } catch (err) {
      console.error('Erreur lors de la mise a jour de la demande :', err);
      setError('Erreur lors de la mise a jour de la demande');
    }
  };

  const handleSendResponse = async (requestId: string) => {
    const message = responseDrafts[requestId]?.trim() ?? '';

    if (!message) {
      setError('Saisissez un message avant de repondre au client.');
      return;
    }

    setError('');
    setSuccess('');

    await updateRequest(requestId, { status: 'vu', pharmacistMessage: message });
    setResponseDrafts((current) => ({ ...current, [requestId]: '' }));
    setSuccess('Reponse envoyee au client avec notification dans son espace prive.');
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
          <p className="text-sm text-gray-600">Le stock est gere par le champ quantite de chaque medicament.</p>
        </div>
        <button
          type="button"
          onClick={scrollToRequests}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Voir les notifications et demandes clients"
        >
          <svg
            viewBox="0 0 24 24"
            className="block h-6 w-6 text-slate-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
          </svg>
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
              Chaque demande est privee et le client recoit votre reponse dans son interface protegee.
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
          <div className="space-y-4">
            {requests.map((request) => (
              <article key={request._id} className={`rounded-xl border p-4 ${request.status === 'nouveau' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {formatRequestType(request.type)} - {request.medicationName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Client: {request.clientEmail} | Contact: {request.contact} | Quantite: {request.quantity}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Date: {request.requestedDate || new Date(request.createdAt).toLocaleString('fr-FR')} | Statut: {formatRequestStatus(request.status)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {request.status === 'nouveau' && (
                      <button
                        type="button"
                        onClick={() => void updateRequest(request._id, { status: 'vu' })}
                        className="rounded bg-amber-500 px-3 py-2 text-sm text-white"
                      >
                        Marquer vu
                      </button>
                    )}
                    {request.status !== 'traite' && (
                      <button
                        type="button"
                        onClick={() => void updateRequest(request._id, { status: 'traite' })}
                        className="rounded bg-green-600 px-3 py-2 text-sm text-white"
                      >
                        Traiter
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">Derniere reponse envoyee</p>
                  {request.pharmacistResponse?.message ? (
                    <>
                      <p className="mt-2 text-sm text-slate-700">{request.pharmacistResponse.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Envoyee le{' '}
                        {request.pharmacistResponse.respondedAt
                          ? new Date(request.pharmacistResponse.respondedAt).toLocaleString('fr-FR')
                          : 'date inconnue'}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">Aucune reponse transmise au client pour le moment.</p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`response-${request._id}`}>
                    Repondre au client
                  </label>
                  <textarea
                    id={`response-${request._id}`}
                    value={responseDrafts[request._id] ?? ''}
                    onChange={(e) => setResponseDrafts((current) => ({ ...current, [request._id]: e.target.value }))}
                    placeholder="Ex: Votre medicament est disponible. Vous pouvez passer aujourd'hui avant 18h."
                    className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleSendResponse(request._id)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Envoyer la reponse
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label htmlFor="medicine-search" className="mb-2 block text-sm font-medium text-slate-700">
            Rechercher un medicament dans le catalogue
          </label>
          <input
            id="medicine-search"
            list="medicine-catalog-options"
            value={catalogQuery}
            onChange={(event) => handleCatalogSelection(event.target.value)}
            placeholder="Ex: parac, amo, dolo..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          <datalist id="medicine-catalog-options">
            {catalogOptions.map((item) => (
              <option key={item.name} value={item.name} />
            ))}
          </datalist>
          {filteredCatalogOptions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filteredCatalogOptions.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleCatalogSelection(item.name)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Saisissez les premieres lettres du medicament, selectionnez-le, puis indiquez seulement la quantite a ajouter au stock.
          </p>
        </div>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom du medicament" required />
        <input
          type="number"
          min="1"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder={selectedMedicament ? 'Quantite a ajouter au stock' : 'Quantite a ajouter'}
          required
        />
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
          {selectedMedicament ? 'Ajouter au stock' : 'Ajouter'}
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
              <td colSpan={9} className="border px-4 py-2 text-center">
                Aucun medicament trouve
              </td>
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

const normalizeMedicineName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export default PharmacienDashboard;
