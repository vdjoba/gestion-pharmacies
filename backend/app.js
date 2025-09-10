"use strict";
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const User = require('./User');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const SECRET = 'pharmacie_secret_key';
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
mongoose.connect('mongodb://localhost:27017/medicaments')
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Obtenir tous les médicaments
app.get('/medicaments', async (req, res) => {
    try {
        const medicaments = await Medicament.find().populate('alternatives');
        res.json(medicaments);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// Réinitialisation du mot de passe (demande)
app.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Créez un token (ex : JWT) et envoyez un email avec le lien de réinitialisation
        const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '1h' });
        // Ici, vous devez envoyer un email avec le lien contenant le token

        res.json({ message: 'Un lien de réinitialisation a été envoyé à votre email.' });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Mise à jour du mot de passe (après avoir cliqué sur le lien)
app.post('/update-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        await user.resetPassword(newPassword);
        res.json({ message: 'Mot de passe réinitialisé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});