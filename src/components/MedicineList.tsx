// src/components/MedicineList.tsx
import React, { useEffect, useState } from 'react';
import { fetchMedicines } from '../services/medicineService';
import type { Medicine } from '../types/Medicine'; // Utilisez 'import type'

const MedicineList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]); // Typage de l'état

  useEffect(() => {
    const getMedicines = async () => {
      try {
        const data = await fetchMedicines(); // Type est maintenant Medicine[]
        setMedicines(data); // Aucune erreur ici
      } catch (error) {
        console.error("Erreur lors du chargement des médicaments :", error);
      }
    };

    getMedicines();
  }, []);

  return (
    <div>
      <h2>Liste des Médicaments</h2>
      <ul>
        {medicines.map((medicine) => (
          <li key={medicine.id}>{medicine.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MedicineList;