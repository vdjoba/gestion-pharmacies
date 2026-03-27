export interface Medicine {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: 'ordonnance' | 'vente_libre' | 'specialise' | 'produit_sante';
  therapeuticClass: 'antipaludique' | 'antitussif' | 'antiinflammatoire' | 'analgesique' | 'autre';
  healthSystemClass: 'cardiovasculaire' | 'antibiotique' | 'autre';
  form: 'comprime' | 'sirop' | 'injection' | 'autre';
  imageUrl?: string;
  pinterestUrl?: string;
  alternatives?: Medicine[];
}
