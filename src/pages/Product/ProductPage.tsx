import React, { useState } from 'react';

interface Medicament {
    _id: string;
    name: string;
    quantity: number;
    price: number;
    isOverTheCounter?: boolean;
}

interface ProductPageProps {
    medicaments: Medicament[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ medicaments }) => {
    console.log('medicaments reçus:', medicaments);
    // État pour le terme de recherche
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [cart, setCart] = useState<CartItem[]>([]);

    const handleAddToCart = (medicament: Medicament) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === medicament._id);
            if (existing) {
                return prevCart.map(item =>
                    item.id === medicament._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [
                    ...prevCart,
                    {
                        id: medicament._id,
                        name: medicament.name,
                        price: medicament.price,
                        quantity: 1,
                        image: getMedicamentImage(medicament.name)
                    }
                ];
            }
        });
    };
    // Filtrage des médicaments en fonction du terme de recherche
    const filteredMedicaments = medicaments.filter(medicament => {
        const matchesSearch = medicament.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeCategory === 'vente-libre') {
            return matchesSearch && medicament.isOverTheCounter;
        }
        return matchesSearch;
    });
    console.log('Nom des médicaments affichés:', filteredMedicaments.map(m => m.name));
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Produits</h1>
            <div className="relative mb-4">
                <img src="Recherche3.png" alt="Recherche" className="absolute left-3 top-2 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Met à jour le terme de recherche
                />
            </div>
            <div className="flex space-x-2 mb-4">
                <button
                    className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600${activeCategory === 'ordonnance' ? ' ring-2 ring-blue-700' : ''}`}
                    onClick={() => setActiveCategory('ordonnance')}
                >Médicaments sur ordonnance</button>
                <button
                    className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600${activeCategory === 'vente-libre' ? ' ring-2 ring-blue-700' : ''}`}
                    onClick={() => setActiveCategory('vente-libre')}
                >Médicaments en vente libre</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Produits de santé</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Médicaments spécialisés</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMedicaments.map((medicament) => (
                    <div key={medicament._id} className="product-card border rounded-md shadow-lg p-2 max-w-xs">
                        <img src={getMedicamentImage(medicament.name)} alt={medicament.name} className="w-full h-32 object-cover mb-2" />
                        <div className="flex-grow">
                            <h2 className="text-lg font-semibold truncate">{medicament.name}</h2>
                            <p className="text-gray-700">Prix : {medicament.price} FCA</p>
                        </div>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mt-2" onClick={() => handleAddToCart(medicament)}>Ajouter au panier</button>
                    </div>
                ))}
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-2">Mon Panier</h2>
                {cart.length === 0 ? (
                    <p className="text-gray-500">Votre panier est vide.</p>
                ) : (
                    <>
                        <ul>
                            {cart.map(item => (
                                <li key={item.id} className="flex items-center mb-2">
                                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover mr-2" />
                                    <span className="font-semibold mr-2">{item.name}</span>
                                    <span className="mr-2">x{item.quantity}</span>
                                    <span className="text-green-700">{item.price * item.quantity} FCA</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-lg font-bold">Prix total : {cart.reduce((total, item) => total + item.price * item.quantity, 0)} FCA</span>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Valider</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductPage;

const getMedicamentImage = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("amoxicilline")) return "Amoxicilline.jpg";
    if (lower.includes("aspirine")) return "Aspirine.jpg";
    if (lower.includes("oméprazole")) return "Oméprazole.jpg";
    if (lower.includes("simvastatine")) return "Simvastatine.jpg";
    if (lower.includes("cephalexine")) return "Cephalexine.jpg";
    if (lower.includes("loperamide")) return "Loperamide.jpg";
     if (lower.includes("ibuprofen")) return "Ibuprofen.jpg";
    return "para.jpg";
};