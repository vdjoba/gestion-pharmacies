import React from 'react';
import { useNavigate } from 'react-router-dom';

const PharmacieInternationalePK14: React.FC = () => {
    const navigate = useNavigate();

    const handleCheckAvailability = () => {
        navigate('/demande'); // Redirige vers AvailabilityRequest
    };

    const handleOrder = () => {
        navigate('/commander'); // Redirige vers OrderForm
    };

    const handleReserve = () => {
        navigate('/reserver'); // Redirige vers ReservationForm
    };

    const handleSubmitPrescription = () => {
        navigate('/ordonance'); // Redirige vers PrescriptionForm
    };

    return (
        <div className="w-full bg-white py-8">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
                        Bienvenue à la Pharmacie Internationale de PK14
                    </h1>
                    <p className="text-gray-600 mb-8 text-center">
                        Carrefour PK14, +237 243 811 818
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={handleCheckAvailability} 
                            className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg shadow transition-colors flex flex-col items-center"
                        >
                            <span className="text-xl font-semibold mb-2">Vérifier la disponibilité</span>
                            <span className="text-sm">Rechercher un médicament et voir les détails</span>
                        </button>

                        <button 
                            onClick={handleOrder} 
                            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow transition-colors flex flex-col items-center"
                        >
                            <span className="text-xl font-semibold mb-2">Commander</span>
                            <span className="text-sm">Passer une commande de médicaments</span>
                        </button>

                        <button 
                            onClick={handleReserve} 
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-6 rounded-lg shadow transition-colors flex flex-col items-center"
                        >
                            <span className="text-xl font-semibold mb-2">Réserver</span>
                            <span className="text-sm">Réserver vos médicaments à l'avance</span>
                        </button>

                        <button 
                            onClick={handleSubmitPrescription} 
                            className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg shadow transition-colors flex flex-col items-center"
                        >
                            <span className="text-xl font-semibold mb-2">Soumettre une ordonnance</span>
                            <span className="text-sm">Pour une livraison avec ordonnance</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacieInternationalePK14;