const mongoose = require('mongoose');

const pharmacyRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['commande', 'reservation', 'disponibilite'],
    required: true,
  },
  medicationName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    min: 1,
    default: 1,
  },
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  requestedDate: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['nouveau', 'vu', 'traite'],
    default: 'nouveau',
  },
  stockAdjusted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('PharmacyRequest', pharmacyRequestSchema);
