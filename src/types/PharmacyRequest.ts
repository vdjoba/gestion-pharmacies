export interface PharmacyRequest {
  _id: string;
  type: 'commande' | 'reservation' | 'disponibilite';
  medicationName: string;
  quantity: number;
  contact: string;
  requestedDate?: string;
  status: 'nouveau' | 'vu' | 'traite';
  createdAt: string;
  updatedAt: string;
}
