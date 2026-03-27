import React, { useEffect, useState } from 'react';
import { fetchMedicines } from '../services/medicineService';
import type { Medicine } from '../types/Medicine';

const MedicineList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const getMedicines = async () => {
      try {
        const data = await fetchMedicines();
        setMedicines(data);
      } catch (error) {
        console.error('Erreur lors du chargement des médicaments :', error);
      }
    };

    void getMedicines();
  }, []);

  return (
    <div>
      <h2>Liste des Médicaments</h2>
      <ul>
        {medicines.map((medicine) => (
          <li key={medicine._id}>{medicine.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MedicineList;
