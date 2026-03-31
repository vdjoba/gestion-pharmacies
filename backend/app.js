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

const SECRET = process.env.JWT_SECRET || 'pharmacie_secret_key';
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicaments';
const allowedWebOrigins = (process.env.ALLOWED_WEB_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const uploadsDirectory = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        if (allowedWebOrigins.length === 0 || allowedWebOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Origine non autorisee par la configuration CORS'));
    }
}));
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

const normalizeEmail = (email) => {
    if (typeof email !== 'string') {
        return '';
    }

    return email.trim().toLowerCase();
};

const getTokenFromRequest = (req) => {
    const authorizationHeader = req.headers.authorization || '';
    if (!authorizationHeader.startsWith('Bearer ')) {
        return null;
    }

    return authorizationHeader.slice(7);
};

const authenticate = async (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
        return res.status(401).json({ message: 'Authentification requise' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Utilisateur introuvable' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Session invalide ou expiree' });
    }
};

const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acces refuse' });
    }

    next();
};

const allowedRoles = ['admin', 'pharmacien', 'client'];

const normalizePortal = (portal) => {
    if (portal === 'admin' || portal === 'client') {
        return portal;
    }

    return '';
};

const validateRole = (role) => allowedRoles.includes(role);

const requirePortalAccess = (portal, role) => {
    if (portal === 'admin') {
        return role === 'admin' || role === 'pharmacien';
    }

    if (portal === 'client') {
        return role === 'client';
    }

    return true;
};

const serializePharmacyRequest = (request) => ({
    _id: request._id,
    clientId: request.clientId,
    clientEmail: request.clientEmail,
    type: request.type,
    medicationName: request.medicationName,
    quantity: request.quantity,
    contact: request.contact,
    requestedDate: request.requestedDate,
    status: request.status,
    pharmacistResponse: {
        message: request.pharmacistResponse?.message || '',
        respondedAt: request.pharmacistResponse?.respondedAt || null,
        respondedBy: request.pharmacistResponse?.respondedBy || null
    },
    clientNotification: {
        isUnread: Boolean(request.clientNotification?.isUnread),
        notifiedAt: request.clientNotification?.notifiedAt || null
    },
    createdAt: request.createdAt,
    updatedAt: request.updatedAt
});

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

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development'
    });
});

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

app.post('/medicaments', authenticate, authorizeRoles('pharmacien', 'admin'), upload.single('image'), async (req, res) => {
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

app.put('/medicaments/:id', authenticate, authorizeRoles('pharmacien', 'admin'), upload.single('image'), async (req, res) => {
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

app.delete('/medicaments/:id', authenticate, authorizeRoles('pharmacien', 'admin'), async (req, res) => {
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

app.get('/pharmacy-requests', authenticate, authorizeRoles('pharmacien', 'admin'), async (req, res) => {
    try {
        const requests = await PharmacyRequest.find().sort({ createdAt: -1 });
        res.json(requests.map(serializePharmacyRequest));
    } catch (error) {
        console.error('Erreur lors de la recuperation des demandes pharmacie :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/my-pharmacy-requests', authenticate, authorizeRoles('client'), async (req, res) => {
    try {
        const requests = await PharmacyRequest.find({ clientId: req.user._id }).sort({ createdAt: -1 });
        res.json(requests.map(serializePharmacyRequest));
    } catch (error) {
        console.error('Erreur lors de la recuperation des demandes client :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/pharmacy-requests', authenticate, authorizeRoles('client'), async (req, res) => {
    const { type, medicationName, quantity, contact, requestedDate } = req.body;

    if (!type || !medicationName || !contact) {
        return res.status(400).json({ message: 'Type, medicament et contact sont requis' });
    }

    try {
        const newRequest = new PharmacyRequest({
            clientId: req.user._id,
            clientEmail: req.user.email,
            type,
            medicationName,
            quantity: Number(quantity || 1),
            contact,
            requestedDate: requestedDate || ''
        });

        await newRequest.save();
        res.status(201).json(serializePharmacyRequest(newRequest));
    } catch (error) {
        console.error('Erreur lors de la creation de la demande pharmacie :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.patch('/pharmacy-requests/:id', authenticate, authorizeRoles('pharmacien', 'admin'), async (req, res) => {
    const { status, pharmacistMessage } = req.body;

    if (!status && !pharmacistMessage) {
        return res.status(400).json({ message: 'Le statut ou la reponse pharmacien est requis' });
    }

    try {
        const request = await PharmacyRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Demande non trouvee' });
        }

        const nextStatus = status || request.status;

        const shouldAdjustStock = nextStatus === 'traite'
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

        request.status = nextStatus;

        if (typeof pharmacistMessage === 'string' && pharmacistMessage.trim()) {
            request.pharmacistResponse = {
                message: pharmacistMessage.trim(),
                respondedAt: new Date(),
                respondedBy: req.user._id
            };
            request.clientNotification = {
                isUnread: true,
                notifiedAt: new Date()
            };
        }

        await request.save();

        res.json(serializePharmacyRequest(request));
    } catch (error) {
        console.error('Erreur lors de la mise a jour de la demande pharmacie :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.patch('/my-pharmacy-requests/:id/read', authenticate, authorizeRoles('client'), async (req, res) => {
    try {
        const request = await PharmacyRequest.findOne({ _id: req.params.id, clientId: req.user._id });

        if (!request) {
            return res.status(404).json({ message: 'Demande non trouvee' });
        }

        if (!request.clientNotification) {
            request.clientNotification = { isUnread: false, notifiedAt: null };
        } else {
            request.clientNotification.isUnread = false;
        }
        await request.save();

        res.json(serializePharmacyRequest(request));
    } catch (error) {
        console.error('Erreur lors de la lecture de la notification client :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/register', async (req, res) => {
    console.log('Inscription demandée avec :', req.body);
    const password = req.body.password;
    const role = req.body.role === 'client' ? 'client' : '';
    const email = normalizeEmail(req.body.email);

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, mot de passe et role client sont requis' });
    }

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

app.get('/admin/users', authenticate, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1, email: 1 });
        res.json(users.map(sanitizeUser));
    } catch (error) {
        console.error('Erreur lors de la rÃ©cupÃ©ration des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/admin/users', authenticate, authorizeRoles('admin'), async (req, res) => {
    const password = req.body.password;
    const role = req.body.role;
    const email = normalizeEmail(req.body.email);

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, mot de passe et rÃ´le sont requis' });
    }

    if (!validateRole(role)) {
        return res.status(400).json({ message: 'Role invalide' });
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

app.put('/admin/users/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
    const password = req.body.password;
    const role = req.body.role;
    const email = normalizeEmail(req.body.email);

    if (!email || !role) {
        return res.status(400).json({ message: 'Email et rÃ´le sont requis' });
    }

    if (!validateRole(role)) {
        return res.status(400).json({ message: 'Role invalide' });
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

app.delete('/admin/users/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
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

app.get('/admin/stats', authenticate, authorizeRoles('admin'), async (req, res) => {
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
        const email = normalizeEmail(req.body.email);
        const portal = normalizePortal(req.body.portal);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Utilisateur non trouvé');
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            console.log('Mot de passe incorrect');
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }

        if (!requirePortalAccess(portal, user.role)) {
            return res.status(403).json({
                message: portal === 'admin'
                    ? "Ce compte n'est pas autorise sur l'administration interne"
                    : "Ce compte doit se connecter via l'interface d'administration"
            });
        }

        console.log('Connexion réussie pour l\'utilisateur :', user.email);
        const token = jwt.sign({ userId: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role, user: sanitizeUser(user) });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

app.post('/reset-password', async (req, res) => {
    const email = normalizeEmail(req.body.email);

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
