import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                
                <div>
                    <Link to="/" className="text-gray-600 px-4 py-2 hover:text-blue-600">
                        Accueil
                    </Link>
                    <Link to="/admin-dashboard" className="text-gray-600 px-4 py-2 hover:text-blue-600">
                        Tableau de bord
                    </Link>
                    <Link to="/products" className="text-gray-600 px-4 py-2 hover:text-blue-600">
                        Produits
                    </Link>
                    <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Connexion
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;