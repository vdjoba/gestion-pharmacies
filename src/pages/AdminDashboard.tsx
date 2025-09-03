import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord Administrateur</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Gestion des utilisateurs</h2>
          <p>Ajoutez, modifiez ou supprimez des utilisateurs et attribuez des rôles.</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Statistiques</h2>
          <p>Consultez les statistiques de ventes et d'activité de la pharmacie.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;