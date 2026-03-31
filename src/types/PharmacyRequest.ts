export interface PharmacyRequest {
  _id: string;
  clientId: string;
  clientEmail: string;
  type: 'commande' | 'reservation' | 'disponibilite';
  medicationName: string;
  quantity: number;
  contact: string;
  requestedDate?: string;
  status: 'nouveau' | 'vu' | 'traite';
  pharmacistResponse?: {
    message: string;
    respondedAt: string | null;
    respondedBy: string | null;
  };
  clientNotification?: {
    isUnread: boolean;
    notifiedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
}
