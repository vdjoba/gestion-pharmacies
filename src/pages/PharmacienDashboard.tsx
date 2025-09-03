import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Medicament {
  _id: string;
  nom: string;
  stock: number;
  prix: number;
}

const PharmacienDashboard: React.FC = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nom: '', stock: 0, prix: 0 });
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedicaments();
  }, []);

  const fetchMedicaments = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Medicament[]>('http://localhost:3000/medicaments');
      setMedicaments(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || 'Erreur lors du chargement des médicaments');
      } else {
        setError('Une erreur inconnue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (med: Medicament) => {
    setFormData({ nom: med.nom, stock: med.stock, prix: med.prix });
    setMode('edit');
    setShowForm(true);
    setSelectedMedicament(med);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await axios.delete(`http://localhost:3000/medicaments/${id}`);
        fetchMedicaments();
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data?.message || 'Erreur lors de la suppression');
        } else {
          setError('Une erreur inconnue est survenue');
        }
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom || formData.stock <= 0 || formData.prix <= 0) {
      setError('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      if (mode === 'add') {
        await axios.post('http://localhost:3000/medicaments', formData);
      } else if (selectedMedicament) {
        await axios.put(`http://localhost:3000/medicaments/${selectedMedicament._id}`, formData);
      }
      setShowForm(false);
      fetchMedicaments();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || 'Erreur lors de l’enregistrement');
      } else {
        setError('Une erreur inconnue est survenue');
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord Pharmacien</h1>
      <button onClick={() => setShowForm(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Ajouter un médicament</button>
      {loading && <p>Chargement des données...</p>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Nom</th>
              <th className="border px-4 py-2">Stock</th>
              <th className="border px-4 py-2">Prix (€)</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicaments.map((med, index) => (
              <tr key={med._id || `index-${index}`}>
                <td className="border px-4 py-2">{med.nom}</td>
                <td className="border px-4 py-2">{med.stock}</td>
                <td className="border px-4 py-2">{med.prix}</td>
                <td className="border px-4 py-2">
                  <button onClick={() => handleEdit(med)} className="mr-2 px-2 py-1 bg-yellow-400 rounded">Modifier</button>
                  <button onClick={() => handleDelete(med._id)} className="px-2 py-1 bg-red-500 text-white rounded">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">{mode === 'add' ? 'Ajouter' : 'Modifier'} un médicament</h2>
          <div className="mb-2">
            <label className="block mb-1">Nom</label>
            <input type="text" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required className="w-full px-2 py-1 border rounded" />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Stock</label>
            <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} required className="w-full px-2 py-1 border rounded" />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Prix (€)</label>
            <input type="number" value={formData.prix} onChange={e => setFormData({ ...formData, prix: Number(e.target.value) })} required className="w-full px-2 py-1 border rounded" />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{mode === 'add' ? 'Ajouter' : 'Enregistrer'}</button>
          <button type="button" onClick={() => setShowForm(false)} className="ml-2 px-4 py-2 bg-gray-400 text-white rounded">Annuler</button>
        </form>
      )}
    </div>
  );
};

export default PharmacienDashboard;