import axios from 'axios';
import type { Medicine } from '../types/Medicine'; // Importez l'interface

const API_URL = 'https://api.example.com/medicines'; // Remplacez par votre API

export const fetchMedicines = async (): Promise<Medicine[]> => {
  const response = await axios.get<Medicine[]>(API_URL);
  return response.data; // Assurez-vous que data est un tableau de Medicine
};
