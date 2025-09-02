// src/components/Footer.tsx

import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto text-center">
                <p className="text-lg font-semibold" 
                   style={{ 
                       color: 'rgba(0, 255, 0, 1)', 
                       textShadow: '0 0 5px rgba(0, 255, 0, 0.7), 0 0 10px rgba(0, 255, 0, 0.5), 0 0 15px rgba(0, 255, 0, 0.3)' 
                   }}>
                    Votre santé, notre priorité
                </p>
            </div>
        </footer>
    );
};

export default Footer;