import React from 'react';
import { useParams } from 'react-router-dom';
import type { Medicine } from '../types/Medicine';

interface MedicineDetailProps {
    medicaments: Medicine[];
}

const MedicineDetail: React.FC<MedicineDetailProps> = ({ medicaments }) => {
    const { id } = useParams<{ id: string }>();
    const medicament = medicaments.find(m => m._id === id);

    return (
        <div>
            {medicament ? (
                <>
                    <h2>Détails du médicament : {medicament.name}</h2>
                    <p>Prix : {medicament.price} FCA</p>
                    <p>Quantité : {medicament.quantity}</p>
                    <p>Catégorie : {medicament.category}</p>
                </>
            ) : (
                <p>Médicament non trouvé.</p>
            )}
        </div>
    );
};

export default MedicineDetail;
