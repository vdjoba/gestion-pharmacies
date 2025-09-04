import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Interface correspondant exactement aux données de la base de données
interface Medicament {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  therapeuticClass: string;
  healthSystemClass: string;
  form: string;
  imageUrl: string;
  alternatives: Medicament[];
}

const PharmacienDashboard: React.FC = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    quantity: number;
    price: number;
    category: string;
    therapeuticClass: string;
    healthSystemClass: string;
    form: string;
    image: File | null; // Stocker l'image comme un fichier
    alternatives: string[];
  }>({
    name: '',
    quantity: 0,
    price: 0,
    category: '',
    therapeuticClass: '',
    healthSystemClass: '',
    form: '',
    image: null, // Initialisé à null
    alternatives: []
  });

  // Charger les médicaments depuis la base de données
  useEffect(() => {
    fetchMedicaments();
  }, []);

  const fetchMedicaments = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Medicament[]>('http://localhost:3000/medicaments');
      console.log('Données récupérées :', res.data);
      setMedicaments(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des médicaments');
      console.error('Erreur lors de la récupération des médicaments :', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Vérifiez si le champ est un fichier
    if (name === 'image' && e.target instanceof HTMLInputElement && e.target.files) {
      setFormData({ ...formData, image: e.target.files[0] }); // Mettre à jour l'image
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData(); // Utiliser FormData pour envoyer des fichiers
      data.append('name', formData.name);
      data.append('quantity', formData.quantity.toString());
      data.append('price', formData.price.toString());
      data.append('category', formData.category);
      data.append('therapeuticClass', formData.therapeuticClass);
      data.append('healthSystemClass', formData.healthSystemClass);
      data.append('form', formData.form);
      if (formData.image) {
        data.append('image', formData.image); // Ajouter l'image au FormData
      }
      formData.alternatives.forEach((alt, index) => {
        data.append(`alternatives[${index}]`, alt);
      });

      if (selectedMedicament) {
        // Mettre à jour un médicament existant
        await axios.put(`http://localhost:3000/medicaments/${selectedMedicament._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Ajouter un nouveau médicament
        const response = await axios.post('http://localhost:3000/medicaments', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Médicament ajouté:', response.data);
      }

      fetchMedicaments();
      setFormData({
        name: '',
        quantity: 0,
        price: 0,
        category: '',
        therapeuticClass: '',
        healthSystemClass: '',
        form: '',
        image: null,
        alternatives: []
      });
      setSelectedMedicament(null);
    } catch (err) {
      console.error('Erreur lors de l\'ajout ou de la mise à jour du médicament:', err);
      setError('Erreur lors de l\'ajout ou de la mise à jour du médicament');
    }
  };

  const handleEdit = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setFormData({
      name: medicament.name,
      quantity: medicament.quantity,
      price: medicament.price,
      category: medicament.category,
      therapeuticClass: medicament.therapeuticClass,
      healthSystemClass: medicament.healthSystemClass,
      form: medicament.form,
      image: null, // L'image ne peut pas être pré-remplie
      alternatives: medicament.alternatives.map((alt) => alt._id)
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/medicaments/${id}`);
      fetchMedicaments();
    } catch (err) {
      console.error('Erreur lors de la suppression du médicament:', err);
      setError('Erreur lors de la suppression du médicament');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord Pharmacien</h1>
      {loading && <p>Chargement des données...</p>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-4">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom" required />
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantité" required />
        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Prix" required />
        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Sélectionner une catégorie</option>
          <option value="ordonnance">Ordonnance</option>
          <option value="vente_libre">Vente libre</option>
          <option value="specialise">Spécialisé</option>
          <option value="produit_sante">Produit de santé</option>
        </select>
        <select name="therapeuticClass" value={formData.therapeuticClass} onChange={handleChange} required>
          <option value="">Sélectionner une classe thérapeutique</option>
          <option value="antipaludique">Antipaludique</option>
          <option value="antitussif">Antitussif</option>
          <option value="antiinflammatoire">Anti-inflammatoire</option>
          <option value="analgésique">Analgésique</option>
          <option value="autre">Autre</option>
        </select>
        <select name="healthSystemClass" value={formData.healthSystemClass} onChange={handleChange} required>
          <option value="">Sélectionner une classe système de santé</option>
          <option value="cardiovasculaire">Cardiovasculaire</option>
          <option value="antibiotique">Antibiotique</option>
          <option value="autre">Autre</option>
        </select>
        <select name="form" value={formData.form} onChange={handleChange} required>
          <option value="">Sélectionner une forme</option>
          <option value="comprimé">Comprimé</option>
          <option value="sirop">Sirop</option>
          <option value="injection">Injection</option>
          <option value="autre">Autre</option>
        </select>
        <input type="file" name="image" onChange={handleChange} accept="image/*" required />
        <button type="submit" className="bg-blue-500 text-white p-2">
          {selectedMedicament ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </form>

      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nom</th>
            <th className="border px-4 py-2">Quantité</th>
            <th className="border px-4 py-2">Prix (€)</th>
            <th className="border px-4 py-2">Catégorie</th>
            <th className="border px-4 py-2">Classe thérapeutique</th>
            <th className="border px-4 py-2">Classe système de santé</th>
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
                <td className="border px-4 py-2">{med.price}</td>
                <td className="border px-4 py-2">{med.category}</td>
                <td className="border px-4 py-2">{med.therapeuticClass}</td>
                <td className="border px-4 py-2">{med.healthSystemClass}</td>
                <td className="border px-4 py-2">{med.form}</td>
                <td className="border px-4 py-2">
                  <img src={med.imageUrl} alt={med.name} className="w-16 h-16 object-cover" />
                </td>
                <td className="border px-4 py-2">
                  <button onClick={() => handleEdit(med)} className="bg-yellow-500 text-white p-1">
                    Éditer
                  </button>
                  <button onClick={() => handleDelete(med._id)} className="bg-red-500 text-white p-1">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="border px-4 py-2 text-center">Aucun médicament trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PharmacienDashboard;