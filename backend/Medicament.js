// Nouveau schéma complet pour Medicament
const mongoose = require('mongoose');

const medicamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        enum: ['ordonnance', 'vente_libre', 'specialise', 'produit_sante'],
        required: true
    },
    therapeuticClass: {
        type: String,
        enum: ['antipaludique', 'antitussif', 'antiinflammatoire', 'analgésique', 'autre'],
        required: true
    },
    healthSystemClass: {
        type: String,
        enum: ['cardiovasculaire', 'antibiotique', 'autre'],
        required: true
    },
    form: {
        type: String,
        enum: ['comprimé', 'sirop', 'injection', 'autre'],
        required: true
    },
    imageUrl: { type: String, required: true },
    alternatives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicament' }]
});

const Medicament = mongoose.model('Medicament', medicamentSchema);
module.exports = Medicament;