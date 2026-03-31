const mongoose = require('mongoose');

const pharmacyRequestSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true,
  },
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
  pharmacistResponse: {
    message: {
      type: String,
      default: '',
      trim: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  clientNotification: {
    isUnread: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  stockAdjusted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('PharmacyRequest', pharmacyRequestSchema);
