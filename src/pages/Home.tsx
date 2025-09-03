import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PharmacieInternationalePK14: React.FC = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<string | null>(null);

    // Déclaration des fonctions AVANT tout rendu JSX
    const handleCheckAvailability = () => {
        navigate('/demande');
    };
    const handleOrder = () => {
        navigate('/commander');
    };
    const handleReserve = () => {
        navigate('/reserver');
    };
    const handleSubmitPrescription = () => {
        navigate('/ordonance');
    };

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    if (role === 'client') {
        return (
            <div className="w-full bg-white py-8">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
                            Bienvenue cher client !
                        </h1>
                        <p className="text-gray-600 mb-8 text-center">
                            Découvrez nos suggestions et accédez rapidement à la commande ou réservation.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button onClick={handleOrder} className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow transition-colors flex flex-col items-center">
                                <span className="text-xl font-semibold mb-2">Commander</span>
                                <span className="text-sm">Passer une commande de médicaments</span>
                            </button>
                            <button onClick={handleReserve} className="bg-yellow-500 hover:bg-yellow-600 text-white p-6 rounded-lg shadow transition-colors flex flex-col items-center">
                                <span className="text-xl font-semibold mb-2">Réserver</span>
                                <span className="text-sm">Réserver vos médicaments à l'avance</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (role === 'pharmacien') {
        navigate('/pharmacien-dashboard');
        return null;
    }
    if (role === 'admin') {
        navigate('/admin-dashboard');
        return null;
    }

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