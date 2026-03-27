import axios from 'axios';
import type { Medicine } from '../types/Medicine';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const MEDICINE_API_URL = `${API_BASE_URL}/medicaments`;

export const fetchMedicines = async (): Promise<Medicine[]> => {
  const response = await axios.get<Medicine[]>(MEDICINE_API_URL);
  return response.data;
};

export const buildApiUrl = (path: string): string => `${API_BASE_URL}${path}`;
