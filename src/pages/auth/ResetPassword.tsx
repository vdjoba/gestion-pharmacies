import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Envoyer une demande de réinitialisation de mot de passe
    try {
      const res = await fetch('http://localhost:3000/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Un lien de réinitialisation a été envoyé à votre email.');
        // Rediriger l'utilisateur après succès
        setTimeout(() => navigate('/login'), 3000); // Redirige vers la page de connexion après 3 secondes
      } else {
        setMessage(data.message || 'Erreur lors de la réinitialisation.');
      }
    } catch (err) {
      setMessage('Erreur serveur');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Réinitialiser le mot de passe
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Adresse email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          {message && <div className="text-green-600 text-sm mb-2">{message}</div>}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Envoyer le lien de réinitialisation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;