import React, { useState } from 'react';
import { getAuthHeaders } from '../services/auth';
import { buildApiUrl } from '../services/medicineService';

const AvailabilityRequest: React.FC = () => {
    const [medication, setMedication] = useState('');
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
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    type: 'disponibilite',
                    medicationName: medication,
                    contact,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erreur lors de la demande.');
                return;
            }

            setMessage(`Demande de disponibilite envoyee pour "${medication}". La pharmacie a ete notifiee.`);
            setMedication('');
            setContact('');
        } catch {
            setError('Erreur serveur');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Demande de Disponibilite d'un Medicament</h1>
            <p className="mb-4 text-sm text-slate-600">
                Le pharmacien pourra vous repondre directement et vous retrouverez cette notification dans votre interface privee.
            </p>
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
                    Envoyer la Demande
                </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    );
};

export default AvailabilityRequest;
