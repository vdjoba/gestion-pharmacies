import React, { useState } from 'react';
import { buildApiUrl } from '../services/medicineService';

const OrderForm: React.FC = () => {
    const [medication, setMedication] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch(buildApiUrl('/pharmacy-requests'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'commande',
                    medicationName: medication,
                    quantity,
                    contact,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erreur lors de la commande.');
                return;
            }

            setMessage(`Commande envoyee pour "${medication}". La pharmacie a ete notifiee.`);
            setMedication('');
            setQuantity(1);
            setContact('');
        } catch {
            setError('Erreur serveur');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Passer une Commande de Medicament</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-md p-4">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="medication">
                        Nom du Medicament
                    </label>
                    <input
                        type="text"
                        id="medication"
                        value={medication}
                        onChange={(e) => setMedication(e.target.value)}
                        placeholder="Entrez le nom du medicament"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="quantity">
                        Quantite
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="contact">
                        Numero de Contact
                    </label>
                    <input
                        type="tel"
                        id="contact"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Entrez votre numero de telephone"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Passer la Commande
                </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    );
};

export default OrderForm;
