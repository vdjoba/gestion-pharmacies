const express = require('express');
const mongoose = require('mongoose');
const Medicament = require('./Medicament'); // Assurez-vous que le chemin est correct
const cors = require('cors'); // Importer le package cors
const User = require('./User');
const jwt = require('jsonwebtoken');
const SECRET = 'pharmacie_secret_key';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Activer CORS
app.use(express.json()); // Middleware pour analyser le corps des requêtes en JSON

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/medicaments', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes

// Obtenir tous les médicaments
app.get('/medicaments', async (req, res) => {
    try {
        const medicaments = await Medicament.find();
        res.json(medicaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ajouter un médicament
app.post('/medicaments', async (req, res) => {
    const { name, quantity, price, category, therapeuticClass, healthSystemClass, form, imageUrl, alternatives } = req.body;

    const newMedicament = new Medicament({
        name,
        quantity,
        price,
        category,
        therapeuticClass,
        healthSystemClass,
        form,
        imageUrl,
        alternatives
    });

    try {
        await newMedicament.save();
        res.status(201).json(newMedicament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mettre à jour un médicament
app.put('/medicaments/:id', async (req, res) => {
    const { name, quantity, price, category, therapeuticClass, healthSystemClass, form, imageUrl, alternatives } = req.body;

    try {
        const updatedMedicament = await Medicament.findByIdAndUpdate(
            req.params.id,
            { name, quantity, price, category, therapeuticClass, healthSystemClass, form, imageUrl, alternatives },
            { new: true, runValidators: true }
        );

        if (!updatedMedicament) {
            return res.status(404).json({ message: 'Médicament non trouvé' });
        }

        res.json(updatedMedicament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Supprimer un médicament
app.delete('/medicaments/:id', async (req, res) => {
    try {
        await Medicament.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Inscription
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = new User({ email, password, role });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Connexion
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });
    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});