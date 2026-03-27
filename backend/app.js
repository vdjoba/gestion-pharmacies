"use strict";
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const User = require('./User');
const Medicament = require('./Medicament');
const PharmacyRequest = require('./PharmacyRequest');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const SECRET = 'pharmacie_secret_key';
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicaments';
const uploadsDirectory = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDirectory));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const sanitizeUser = (user) => ({
    _id: user._id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

const parseAlternatives = (alternatives) => {
    if (!alternatives) {
        return [];
    }

    if (Array.isArray(alternatives)) {
        return alternatives.filter(Boolean);
    }

    if (typeof alternatives === 'string') {
        return alternatives
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeMedicamentPayload = (body, file) => ({
    name: body.name ?? body.nom,
    quantity: Number(body.quantity ?? body.quantite ?? 0),
    price: Number(body.price ?? body.prix ?? 0),
    category: body.category ?? body.categorie,
    therapeuticClass: body.therapeuticClass ?? body.therapeutique,
    healthSystemClass: body.healthSystemClass ?? body.systeme,
    form: body.form ?? body.forme,
    imageUrl: file ? `/uploads/${file.filename}` : body.imageUrl ?? '',
    pinterestUrl: body.pinterestUrl ?? '',
    alternatives: parseAlternatives(body.alternatives)
});

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

app.get('/medicaments', async (req, res) => {
    try {
        const medicaments = await Medicament.find().populate('alternatives');
        res.json(medicaments);
    } catch (error) {
        console.error('Erreur lors de la récupération des médicaments :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/medicaments/:id', async (req, res) => {
    try {
        const medicament = await Medicament.findById(req.params.id).populate('alternatives');
        if (!medicament) {
            return res.status(404).json({ message: 'Médicament non trouvé' });
        }
        res.json(medicament);
    } catch (error) {
        console.error('Erreur lors de la récupération du médicament :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/medicaments', upload.single('image'), async (req, res) => {
    const payload = normalizeMedicamentPayload(req.body, req.file);

    if (!payload.name || !payload.quantity || !payload.price || !payload.category || !payload.therapeuticClass || !payload.healthSystemClass || !payload.form) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    try {
        const newMedicament = new Medicament(payload);
        await newMedicament.save();
        const savedMedicament = await Medicament.findById(newMedicament._id).populate('alternatives');
        res.status(201).json(savedMedicament);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du médicament :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.put('/medicaments/:id', upload.single('image'), async (req, res) => {
    try {
        const current = await Medicament.findById(req.params.id);
        if (!current) {
            return res.status(404).json({ message: 'Médicament non trouvé' });
        }

        const payload = normalizeMedicamentPayload(req.body, req.file);
        const updateData = {
            ...payload,
            imageUrl: payload.imageUrl || current.imageUrl
        };

        const updatedMedicament = await Medicament.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('alternatives');

        res.json(updatedMedicament);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du médicament :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.delete('/medicaments/:id', async (req, res) => {
    try {
        const deletedMedicament = await Medicament.findByIdAndDelete(req.params.id);
        if (!deletedMedicament) {
            return res.status(404).json({ message: 'Médicament non trouvé' });
        }
        res.json({ message: 'Médicament supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du médicament :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/pharmacy-requests', async (req, res) => {
    try {
        const requests = await PharmacyRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Erreur lors de la recuperation des demandes pharmacie :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/pharmacy-requests', async (req, res) => {
    const { type, medicationName, quantity, contact, requestedDate } = req.body;

    if (!type || !medicationName || !contact) {
        return res.status(400).json({ message: 'Type, medicament et contact sont requis' });
    }

    try {
        const newRequest = new PharmacyRequest({
            type,
            medicationName,
            quantity: Number(quantity || 1),
            contact,
            requestedDate: requestedDate || ''
        });

        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Erreur lors de la creation de la demande pharmacie :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.patch('/pharmacy-requests/:id', async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Le statut est requis' });
    }

    try {
        const request = await PharmacyRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Demande non trouvee' });
        }

        const shouldAdjustStock = status === 'traite'
            && !request.stockAdjusted
            && ['commande', 'reservation'].includes(request.type);

        if (shouldAdjustStock) {
            const medicament = await Medicament.findOne({ name: request.medicationName.trim() });

            if (!medicament) {
                return res.status(404).json({ message: 'Medicament introuvable pour ajuster le stock' });
            }

            if (medicament.quantity < request.quantity) {
                return res.status(400).json({ message: 'Stock insuffisant pour traiter cette demande' });
            }

            medicament.quantity -= request.quantity;
            await medicament.save();
            request.stockAdjusted = true;
        }

        request.status = status;
        await request.save();

        res.json(request);
    } catch (error) {
        console.error('Erreur lors de la mise a jour de la demande pharmacie :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

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

app.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1, email: 1 });
        res.json(users.map(sanitizeUser));
    } catch (error) {
        console.error('Erreur lors de la rÃ©cupÃ©ration des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/admin/users', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, mot de passe et rÃ´le sont requis' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet utilisateur existe dÃ©jÃ ' });
        }

        const user = new User({ email, password, role });
        await user.save();
        res.status(201).json(sanitizeUser(user));
    } catch (error) {
        console.error('Erreur lors de la crÃ©ation de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.put('/admin/users/:id', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ message: 'Email et rÃ´le sont requis' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvÃ©' });
        }

        const userWithSameEmail = await User.findOne({ email, _id: { $ne: req.params.id } });
        if (userWithSameEmail) {
            return res.status(400).json({ message: 'Un autre utilisateur utilise dÃ©jÃ  cet email' });
        }

        user.email = email;
        user.role = role;

        if (password) {
            user.password = password;
        }

        await user.save();
        res.json(sanitizeUser(user));
    } catch (error) {
        console.error('Erreur lors de la mise Ã  jour de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.delete('/admin/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvÃ©' });
        }

        res.json({ message: 'Utilisateur supprimÃ© avec succÃ¨s' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/admin/stats', async (req, res) => {
    try {
        const [users, medicaments] = await Promise.all([
            User.find(),
            Medicament.find()
        ]);

        const roleCounts = users.reduce((accumulator, user) => {
            const role = user.role || 'user';
            accumulator[role] = (accumulator[role] || 0) + 1;
            return accumulator;
        }, {});

        const totalStock = medicaments.reduce((sum, medicament) => sum + medicament.quantity, 0);
        const stockValue = medicaments.reduce((sum, medicament) => sum + (medicament.quantity * medicament.price), 0);
        const lowStockCount = medicaments.filter(medicament => medicament.quantity > 0 && medicament.quantity <= 10).length;
        const outOfStockCount = medicaments.filter(medicament => medicament.quantity === 0).length;

        res.json({
            users: {
                total: users.length,
                admins: roleCounts.admin || 0,
                pharmaciens: roleCounts.pharmacien || 0,
                clients: roleCounts.client || 0,
                others: Object.entries(roleCounts)
                    .filter(([role]) => !['admin', 'pharmacien', 'client'].includes(role))
                    .reduce((sum, [, count]) => sum + count, 0)
            },
            medicaments: {
                total: medicaments.length,
                totalStock,
                lowStockCount,
                outOfStockCount,
                stockValue
            }
        });
    } catch (error) {
        console.error('Erreur lors de la rÃ©cupÃ©ration des statistiques admin :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

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

app.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '1h' });
        void token;

        res.json({ message: 'Un lien de réinitialisation a été envoyé à votre email.' });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

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

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
