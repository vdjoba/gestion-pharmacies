import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { Medicine } from '../types/Medicine';
import { API_BASE_URL } from '../services/medicineService';

const ProductList: React.FC = () => {
    const [medications, setMedications] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMedications = async () => {
            try {
                const response = await axios.get<Medicine[]>(`${API_BASE_URL}/medicaments`);
                setMedications(response.data);
            } catch {
                setError('Erreur lors de la récupération des médicaments');
            } finally {
                setLoading(false);
            }
        };

        void fetchMedications();
    }, []);

    if (loading) return <p>Chargement...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Liste des médicaments</h1>
            <ul>
                {medications.map(medication => (
                    <li key={medication._id}>
                        {medication.name} - Quantité: {medication.quantity} - Prix: {medication.price}€
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;
