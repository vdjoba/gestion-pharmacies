const mongoose = require('mongoose');
const Medication = require('./Medicament'); // Assurez-vous que le chemin est correct
require('./db'); // Importez le fichier de connexion

const medications = [
    { name: "Paracetamol", quantity: 50, price: 2.5, isOverTheCounter: true },
    { name: "Ibuprofène", quantity: 30, price: 3.0, isOverTheCounter: true },
    { name: "Amoxicilline", quantity: 20, price: 5.0, isOverTheCounter: true },
    { name: "Céphalexine", quantity: 15, price: 4.5, isOverTheCounter: true },
    { name: "Aspirine", quantity: 40, price: 1.5, isOverTheCounter: true },
    { name: "Loperamide", quantity: 25, price: 2.0, isOverTheCounter: true },
    { name: "Oméprazole", quantity: 35, price: 6.0, isOverTheCounter: true },
    { name: "Simvastatine", quantity: 10, price: 7.5, isOverTheCounter: true }
];

mongoose.connection.once('open', async () => {
    console.log('Connecté à la base de données, ajout des médicaments...');
    
    await Medication.insertMany(medications);
    console.log('Médicaments ajoutés avec succès');
    
    mongoose.connection.close();
});