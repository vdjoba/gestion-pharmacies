import React, { useState } from 'react';

const ReservationForm: React.FC = () => {
    const [medication, setMedication] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [contact, setContact] = useState('');
    const [date, setDate] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logique pour envoyer la réservation (simulée ici)
        setMessage(`Réservation de "${medication}" (quantité: ${quantity}) effectuée pour le ${date}.`);
        setMedication('');
        setQuantity(1);
        setContact('');
        setDate('');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Réserver des Médicaments</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-md p-4">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="medication">Nom du Médicament</label>
                    <input
                        type="text"
                        id="medication"
                        value={medication}
                        onChange={(e) => setMedication(e.target.value)}
                        placeholder="Entrez le nom du médicament"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="quantity">Quantité</label>
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
                    <label className="block text-gray-700 mb-2" htmlFor="contact">Numéro de Contact</label>
                    <input
                        type="tel"
                        id="contact"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Entrez votre numéro de téléphone"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="date">Date de Réservation</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                        required
                    />
                </div>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                    Réserver
                </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>
    );
};

export default ReservationForm;