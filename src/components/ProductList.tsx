// src/components/ProductList.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Medication {
    _id: string;
    name: string;
    quantity: number;
    price: number;
}

const ProductList: React.FC = () => {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMedications = async () => {
            try {
                const response = await axios.get<Medication[]>('http://localhost:3000/medications');
                setMedications(response.data);
            } catch (error) {
                setError('Erreur lors de la récupération des médicaments');
            } finally {
                setLoading(false);
            }
        };

        fetchMedications();
    }, []);

    if (loading) return <p>Chargement...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Liste des Médicaments</h1>
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