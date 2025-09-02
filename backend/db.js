const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/medicaments')
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));