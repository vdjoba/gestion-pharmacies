import React from 'react';

interface Medicament {
    _id: string;
    name: string;
    quantity: number;
    price: number;
}

interface MedicineDetailProps {
    medicaments: Medicament[];
}

const MedicineDetail: React.FC<MedicineDetailProps> = ({ medicaments }) => {
    // Vous pouvez récupérer l'ID à partir de l'URL (par exemple, via React Router) pour afficher les détails
    const medicineId = '...'; // Remplacez ceci par la logique pour récupérer l'ID
    const medicament = medicaments.find(m => m._id === medicineId);

    return (
        <div>
            {medicament ? (
                <>
                    <h2>Détails du Médicament: {medicament.name}</h2>
                    <p>Prix: {medicament.price} FCA</p>
                    <p>Quantité: {medicament.quantity}</p>
                </>
            ) : (
                <p>Médicament non trouvé.</p>
            )}
        </div>
    );
};

export default MedicineDetail;