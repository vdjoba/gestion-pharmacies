import React, { useState } from 'react';

const AvailabilityRequest: React.FC = () => {
    const [medication, setMedication] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(`Demande de disponibilité pour "${medication}" envoyée avec succès.`);
        setMedication('');
        setContact('');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Demande de Disponibilité d'un Médicament</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-md p-4">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="medication">
                        Nom du Médicament
                    </label>
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
                    <label className="block text-gray-700 mb-2" htmlFor="contact">
                        Numéro de Contact
                    </label>
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
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Envoyer la Demande
                </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>
    );
};

export default AvailabilityRequest;