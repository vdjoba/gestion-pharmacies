const mongoose = require('mongoose');

const medicamentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    category: {
        type: String,
        enum: ['ordonnance', 'vente_libre', 'specialise', 'produit_sante'],
        required: true
    },
    therapeuticClass: {
        type: String,
        enum: ['antipaludique', 'antitussif', 'antiinflammatoire', 'analgesique', 'autre'],
        required: true
    },
    healthSystemClass: {
        type: String,
        enum: ['cardiovasculaire', 'antibiotique', 'autre'],
        required: true
    },
    form: {
        type: String,
        enum: ['comprime', 'sirop', 'injection', 'autre'],
        required: true
    },
    imageUrl: { type: String, default: '' },
    pinterestUrl: { type: String, default: '' },
    alternatives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicament' }]
}, { timestamps: true });

const Medicament = mongoose.model('Medicament', medicamentSchema);
module.exports = Medicament;
