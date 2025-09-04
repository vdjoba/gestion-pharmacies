"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importStar(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const express = require('express');
const cors = require('cors');
const User = require('./User');
const jwt = require('jsonwebtoken');
const SECRET = 'pharmacie_secret_key';
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Configuration de multer pour stocker les fichiers dans un dossier local
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });
// Connexion à MongoDB
mongoose_1.default.connect('mongodb://localhost:27017/medicaments')
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));
// Obtenir tous les médicaments
app.get('/medicaments', async (req, res) => {
    try {
        const medicaments = await Medicament.find().populate('alternatives');
        res.json(medicaments);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des médicaments :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// Ajouter un médicament
app.post('/medicaments', upload.single('image'), async (req, res) => {
    console.log('Données reçues :', req.body);
    console.log('Fichier reçu :', req.file);
    const { name, quantity, price, category, therapeuticClass, healthSystemClass, form } = req.body;
    if (!name || !quantity || !price || !category || !therapeuticClass || !healthSystemClass || !form) {
        console.log('Champs manquants dans la requête');
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const newMedicament = new Medicament({
            name,
            quantity,
            price,
            category,
            therapeuticClass,
            healthSystemClass,
            form,
            imageUrl
        });
        console.log('Médicament à sauvegarder :', newMedicament);
        await newMedicament.save();
        console.log('Médicament sauvegardé avec succès');
        res.status(201).json(newMedicament);
    }
    catch (error) {
        console.error('Erreur lors de l\'ajout du médicament :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// Inscription
app.post('/register', async (req, res) => {
    console.log('Inscription demandée avec :', req.body);
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('L\'utilisateur existe déjà');
            return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
        }
        const user = new User({ email, password, role });
        await user.save();
        console.log('Utilisateur créé avec succès');
        res.status(201).json({ message: 'Utilisateur créé' });
    }
    catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ message: 'Erreur inattendue' });
    }
});
// Connexion
app.post('/login', async (req, res) => {
    console.log('Requête reçue pour connexion :', req.body);
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            console.log('Utilisateur non trouvé');
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }
        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            console.log('Mot de passe incorrect');
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }
        console.log('Connexion réussie pour l\'utilisateur :', user.email);
        const token = jwt.sign({ userId: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role });
    }
    catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});
// Réinitialisation du mot de passe
app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        await user.resetPassword(newPassword);
        res.json({ message: 'Mot de passe réinitialisé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe :', error);
        res.status(500).json({ message: 'Erreur inattendue' });
    }
});
// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
const formData = {
    name: '',
    quantity: 0,
    price: 0,
    category: '',
    therapeuticClass: '',
    healthSystemClass: '',
    form: '',
    image: null
};
const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('quantity', formData.quantity.toString());
    data.append('price', formData.price.toString());
    data.append('category', formData.category);
    data.append('therapeuticClass', formData.therapeuticClass);
    data.append('healthSystemClass', formData.healthSystemClass);
    data.append('form', formData.form);
    if (formData.image) {
        data.append('image', formData.image);
    }
    try {
        const response = await axios_1.default.post('http://localhost:3000/medicaments', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Médicament ajouté :', response.data);
    }
    catch (err) {
        console.error('Erreur lors de l\'ajout du médicament :', err);
    }
};
const medicamentSchema = new mongoose_1.default.Schema({
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
    alternatives: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Medicament' }]
});
const Medicament = mongoose_1.default.model('Medicament', medicamentSchema);
//# sourceMappingURL=app.js.map