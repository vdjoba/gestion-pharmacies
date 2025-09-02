import React, { useState } from 'react';

const PrescriptionForm: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file) {
            setMessage('Veuillez télécharger une ordonnance.');
            return;
        }

        // Logique pour soumettre l'ordonnance (simulée ici)
        setMessage(`Ordonnance soumise avec succès pour le contact : ${contact}`);
        setFile(null);
        setContact('');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Soumettre une Ordonnance</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-md p-4">
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
                    <label className="block text-gray-700 mb-2" htmlFor="file">Télécharger l'Ordonnance</label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="border border-gray-300 rounded-md p-2 w-full"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                    />
                </div>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                    Soumettre
                </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>
    );
};

export default PrescriptionForm;