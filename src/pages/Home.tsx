import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<string | null>(null);

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
                    <div className="rounded-lg bg-white p-6 shadow-lg">
                        <h1 className="mb-6 text-center text-3xl font-bold text-green-700">
                            Bienvenue cher client !
                        </h1>
                        <p className="mb-8 text-center text-gray-600">
                            Accedez rapidement a la disponibilite, a la commande, a la reservation et au depot d&apos;ordonnance.
                        </p>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <button onClick={handleCheckAvailability} className="flex flex-col items-center rounded-lg bg-green-500 p-6 text-white shadow transition-colors hover:bg-green-600">
                                <span className="mb-2 text-xl font-semibold">Demander la disponibilite</span>
                                <span className="text-sm">Verifier si votre medicament est disponible</span>
                            </button>
                            <button onClick={handleOrder} className="flex flex-col items-center rounded-lg bg-blue-500 p-6 text-white shadow transition-colors hover:bg-blue-600">
                                <span className="mb-2 text-xl font-semibold">Commander</span>
                                <span className="text-sm">Passer une commande de medicaments</span>
                            </button>
                            <button onClick={handleReserve} className="flex flex-col items-center rounded-lg bg-yellow-500 p-6 text-white shadow transition-colors hover:bg-yellow-600">
                                <span className="mb-2 text-xl font-semibold">Reserver</span>
                                <span className="text-sm">Reserver vos medicaments a l&apos;avance</span>
                            </button>
                            <button onClick={handleSubmitPrescription} className="flex flex-col items-center rounded-lg bg-purple-500 p-6 text-white shadow transition-colors hover:bg-purple-600">
                                <span className="mb-2 text-xl font-semibold">Soumettre une ordonnance</span>
                                <span className="text-sm">Envoyer votre ordonnance a la pharmacie</span>
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
                <div className="rounded-lg bg-white p-6 shadow-lg">
                    <h1 className="mb-6 text-center text-3xl font-bold text-green-700">
                        Bienvenue a la Pharmacie Internationale de PK14
                    </h1>
                    <p className="mb-8 text-center text-gray-600">
                        Carrefour PK14, +237 243 811 818
                    </p>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <button
                            onClick={handleCheckAvailability}
                            className="flex flex-col items-center rounded-lg bg-green-500 p-6 text-white shadow transition-colors hover:bg-green-600"
                        >
                            <span className="mb-2 text-xl font-semibold">Verifier la disponibilite</span>
                            <span className="text-sm">Rechercher un medicament et voir les details</span>
                        </button>

                        <button
                            onClick={handleOrder}
                            className="flex flex-col items-center rounded-lg bg-blue-500 p-6 text-white shadow transition-colors hover:bg-blue-600"
                        >
                            <span className="mb-2 text-xl font-semibold">Commander</span>
                            <span className="text-sm">Passer une commande de medicaments</span>
                        </button>

                        <button
                            onClick={handleReserve}
                            className="flex flex-col items-center rounded-lg bg-yellow-500 p-6 text-white shadow transition-colors hover:bg-yellow-600"
                        >
                            <span className="mb-2 text-xl font-semibold">Reserver</span>
                            <span className="text-sm">Reserver vos medicaments a l&apos;avance</span>
                        </button>

                        <button
                            onClick={handleSubmitPrescription}
                            className="flex flex-col items-center rounded-lg bg-purple-500 p-6 text-white shadow transition-colors hover:bg-purple-600"
                        >
                            <span className="mb-2 text-xl font-semibold">Soumettre une ordonnance</span>
                            <span className="text-sm">Pour une livraison avec ordonnance</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
