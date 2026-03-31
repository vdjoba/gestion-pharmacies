import type { Medicine } from '../types/Medicine';

export interface CatalogMedicineTemplate {
  name: string;
  category: Medicine['category'];
  therapeuticClass: Medicine['therapeuticClass'];
  healthSystemClass: Medicine['healthSystemClass'];
  form: Medicine['form'];
  defaultPrice: number;
}

export const medicineCatalog: CatalogMedicineTemplate[] = [
  { name: 'Amoxicilline', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'antibiotique', form: 'comprime', defaultPrice: 2500 },
  { name: 'Ampicilline', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'antibiotique', form: 'comprime', defaultPrice: 2200 },
  { name: 'Artesunate', category: 'ordonnance', therapeuticClass: 'antipaludique', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 3000 },
  { name: 'Aspirine', category: 'vente_libre', therapeuticClass: 'analgesique', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1000 },
  { name: 'Azithromycine', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'antibiotique', form: 'comprime', defaultPrice: 4000 },
  { name: 'Cefixime', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'antibiotique', form: 'comprime', defaultPrice: 4500 },
  { name: 'Ceftriaxone', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'antibiotique', form: 'injection', defaultPrice: 3500 },
  { name: 'Cetirizine', category: 'vente_libre', therapeuticClass: 'autre', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1500 },
  { name: 'Chloroquine', category: 'ordonnance', therapeuticClass: 'antipaludique', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1800 },
  { name: 'Ciprofloxacine', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'antibiotique', form: 'comprime', defaultPrice: 2800 },
  { name: 'Clamoxyl', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'antibiotique', form: 'sirop', defaultPrice: 3200 },
  { name: 'Coartem', category: 'ordonnance', therapeuticClass: 'antipaludique', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 5000 },
  { name: 'Dafalgan', category: 'vente_libre', therapeuticClass: 'analgesique', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1200 },
  { name: 'Diclofenac', category: 'ordonnance', therapeuticClass: 'antiinflammatoire', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1800 },
  { name: 'Doliprane', category: 'vente_libre', therapeuticClass: 'analgesique', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1200 },
  { name: 'Efferalgan', category: 'vente_libre', therapeuticClass: 'analgesique', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1200 },
  { name: 'Ibuprofene', category: 'vente_libre', therapeuticClass: 'antiinflammatoire', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1500 },
  { name: 'Loperamide', category: 'vente_libre', therapeuticClass: 'autre', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1200 },
  { name: 'Metronidazole', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'antibiotique', form: 'comprime', defaultPrice: 1800 },
  { name: 'Omeprazole', category: 'vente_libre', therapeuticClass: 'autre', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 2000 },
  { name: 'Paracetamol', category: 'vente_libre', therapeuticClass: 'analgesique', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1000 },
  { name: 'Quinine', category: 'ordonnance', therapeuticClass: 'antipaludique', healthSystemClass: 'autre', form: 'injection', defaultPrice: 3000 },
  { name: 'Salbutamol', category: 'ordonnance', therapeuticClass: 'antitussif', healthSystemClass: 'autre', form: 'sirop', defaultPrice: 2500 },
  { name: 'Simvastatine', category: 'ordonnance', therapeuticClass: 'autre', healthSystemClass: 'cardiovasculaire', form: 'comprime', defaultPrice: 4500 },
  { name: 'Vitamine C', category: 'produit_sante', therapeuticClass: 'autre', healthSystemClass: 'autre', form: 'comprime', defaultPrice: 1000 },
];
