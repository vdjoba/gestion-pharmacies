// src/types/Medicine.ts
export interface Medicine {
  id: number;
  name: string;
  quantity?:number;
  description?: string; 
  price?: number;       
}