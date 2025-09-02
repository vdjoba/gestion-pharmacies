import React, { useState, useEffect } from "react";

// Définition du type pour un médicament
interface Medicament {
  nom: string;
  quantite: number;
  prix: number;
  categorie: string;
  therapeutique?: string;
  systeme?: string;
  forme?: string;
  imageUrl?: string;
  alternatives?: string;
  id?: number;
}

const DashboardAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState("medicaments");
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [form, setForm] = useState<Medicament>({ nom: "", quantite: 0, prix: 0, categorie: "vente libre", therapeutique: "", systeme: "", forme: "", imageUrl: "", alternatives: "" });

  useEffect(() => {
    fetch("http://localhost:3000/medicaments")
      .then(res => res.json())
      .then(async data => {
        // Pour chaque médicament, récupérer l'image depuis l'API publique
        const medsWithImages = await Promise.all(data.map(async (med: any) => {
          // Adapter les propriétés du backend à celles attendues par le front
          const mappedMed = {
            nom: med.name,
            quantite: med.quantity,
            prix: med.price,
            categorie: med.isOverTheCounter ? "vente libre" : "ordonnance",
            therapeutique: med.therapeutique || "",
            systeme: med.systeme || "",
            forme: med.forme || "",
            imageUrl: med.imageUrl || "",
            alternatives: med.alternatives ? med.alternatives.join(",") : "",
            id: med._id || med.id
          };
          try {
            const response = await fetch(`https://api.medicaments.gouv.fr/v1/medicaments?nom=${encodeURIComponent(mappedMed.nom)}`);
            const result = await response.json();
            const imageUrl = result && result[0] && result[0].imageUrl ? result[0].imageUrl : mappedMed.imageUrl || "";
            return { ...mappedMed, imageUrl };
          } catch {
            return { ...mappedMed };
          }
        }));
        setMedicaments(medsWithImages);
      })
      .catch(() => setMedicaments([]));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Gestion de la Pharmacie</h1>
      <nav className="flex justify-center mb-8 space-x-8">
        <button className={`text-blue-700 ${activeTab === "dashboard" ? "font-bold border-b-4 border-blue-700" : ""}`} onClick={() => setActiveTab("dashboard")}>Tableau de Bord</button>
        <button className={`text-blue-700 ${activeTab === "medicaments" ? "font-bold border-b-4 border-blue-700" : ""}`} onClick={() => setActiveTab("medicaments")}>Médicaments</button>
        <button className={`text-blue-700 ${activeTab === "stocks" ? "font-bold border-b-4 border-blue-700" : ""}`} onClick={() => setActiveTab("stocks")}>Stocks</button>
        <button className={`text-blue-700 ${activeTab === "utilisateurs" ? "font-bold border-b-4 border-blue-700" : ""}`} onClick={() => setActiveTab("utilisateurs")}>Utilisateurs</button>
        <button className={`text-blue-700 ${activeTab === "ventes" ? "font-bold border-b-4 border-blue-700" : ""}`} onClick={() => setActiveTab("ventes")}>Ventes</button>
      </nav>
      {activeTab === "medicaments" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Gestion des Médicaments</h2>
          <form className="mb-6 space-y-4" onSubmit={async e => {
            e.preventDefault();
            // Création côté backend
            const response = await fetch("http://localhost:3000/medicaments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form)
            });
            const newMed = await response.json();
            setMedicaments([...medicaments, newMed]);
            setForm({ nom: "", quantite: 0, prix: 0, categorie: "vente libre", therapeutique: "", systeme: "", forme: "", imageUrl: "", alternatives: "" });
          }}>
            <input type="text" placeholder="Nom" className="w-full border rounded px-4 py-2" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
            <input type="number" placeholder="Quantité" className="w-full border rounded px-4 py-2" value={form.quantite} onChange={e => setForm({ ...form, quantite: Number(e.target.value) })} />
            <input type="number" placeholder="Prix" className="w-full border rounded px-4 py-2" value={form.prix} onChange={e => setForm({ ...form, prix: Number(e.target.value) })} />
            <select className="w-full border rounded px-4 py-2" value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
              <option value="ordonnance">Ordonnance</option>
              <option value="vente libre">Vente libre</option>
              <option value="spécialisé">Spécialisé</option>
              <option value="produit de santé">Produit de santé</option>
            </select>
            <select className="w-full border rounded px-4 py-2" value={form.therapeutique} onChange={e => setForm({ ...form, therapeutique: e.target.value })}>
              <option value="">Classe thérapeutique</option>
              <option value="antipaludique">Antipaludique</option>
              <option value="antitussif">Antitussif</option>
              <option value="antiinflammatoire">Antiinflammatoire</option>
              <option value="analgésique">Analgésique</option>
              <option value="autre">Autre</option>
            </select>
            <select className="w-full border rounded px-4 py-2" value={form.systeme} onChange={e => setForm({ ...form, systeme: e.target.value })}>
              <option value="">Classe système de santé</option>
              <option value="cardiovasculaire">Cardiovasculaire</option>
              <option value="antibiotique">Antibiotique</option>
              <option value="autre">Autre</option>
            </select>
            <select className="w-full border rounded px-4 py-2" value={form.forme} onChange={e => setForm({ ...form, forme: e.target.value })}>
              <option value="">Forme</option>
              <option value="comprimé">Comprimé</option>
              <option value="sirop">Sirop</option>
              <option value="injection">Injection</option>
              <option value="autre">Autre</option>
            </select>
            <input type="text" placeholder="URL de l'image" className="w-full border rounded px-4 py-2" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            <input type="text" placeholder="Alternatives (IDs séparés par des virgules)" className="w-full border rounded px-4 py-2" value={form.alternatives} onChange={e => setForm({ ...form, alternatives: e.target.value })} />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
          </form>
          <h3 className="text-xl font-bold mb-2">Liste des Médicaments</h3>
          <div className="border rounded p-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Nom</th>
                  <th className="text-left">Quantité</th>
                  <th className="text-left">Prix</th>
                  <th className="text-left">Catégorie</th>
                  <th className="text-left">Classe thérapeutique</th>
                  <th className="text-left">Classe système</th>
                  <th className="text-left">Forme</th>
                  <th className="text-left">Image</th>
                  <th className="text-left">Alternatives</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {medicaments.map(med => (
                  <tr key={med.id}>
                    <td>{med.nom}</td>
                    <td>{med.quantite}</td>
                    <td>{med.prix} FCA</td>
                    <td>{med.categorie}</td>
                    <td>{med.therapeutique || "-"}</td>
                    <td>{med.systeme || "-"}</td>
                    <td>{med.forme || "-"}</td>
                    <td>{med.imageUrl ? <img src={med.imageUrl} alt="img" className="w-12 h-12 object-cover" /> : "-"}</td>
                    <td>{med.alternatives || "-"}</td>
                    <td>
                      <button className="text-yellow-600 mr-2" onClick={async () => {
                        // Modification côté backend
                        const updatedMed = { ...med, nom: prompt("Nouveau nom", med.nom) || med.nom };
                        await fetch(`http://localhost:3000/medicaments/${med.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(updatedMed)
                        });
                        setMedicaments(medicaments.map(m => m.id === med.id ? updatedMed : m));
                      }}>Modifier</button>
                      <button className="text-red-600" onClick={async () => {
                        // Suppression côté backend
                        await fetch(`http://localhost:3000/medicaments/${med.id}`, { method: "DELETE" });
                        setMedicaments(medicaments.filter(m => m.id !== med.id));
                      }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {activeTab === "stocks" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Gestion des Stocks</h2>
          <div className="mb-4">(Alertes de stock faible ici)</div>
          <div className="border rounded p-4">(Historique des stocks ici)</div>
        </section>
      )}
      {activeTab === "utilisateurs" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Gestion des Utilisateurs</h2>
          <form className="mb-6 space-y-4">
            <input type="text" placeholder="Nom" className="w-full border rounded px-4 py-2" />
            <input type="text" placeholder="Rôle" className="w-full border rounded px-4 py-2" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
          </form>
          <h3 className="text-xl font-bold mb-2">Liste des Utilisateurs</h3>
          <div className="border rounded p-4">(Tableau des utilisateurs ici)</div>
        </section>
      )}
      {activeTab === "ventes" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Gestion des Ventes</h2>
          <div className="mb-4">(Historique des ventes ici)</div>
          <div className="border rounded p-4">(Rapports et graphiques ici)</div>
        </section>
      )}
      {activeTab === "dashboard" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tableau de Bord</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white shadow rounded p-4">
              <h3 className="text-lg font-semibold">Médicaments en stock</h3>
              <p className="text-3xl font-bold">--</p>
            </div>
            <div className="bg-white shadow rounded p-4">
              <h3 className="text-lg font-semibold">Alertes de stock faible</h3>
              <p className="text-3xl font-bold">--</p>
            </div>
            <div className="bg-white shadow rounded p-4">
              <h3 className="text-lg font-semibold">Derniers ajouts</h3>
              <p className="text-3xl font-bold">--</p>
            </div>
          </div>
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Graphique des ventes</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">Graphique à venir...</div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardAdmin;