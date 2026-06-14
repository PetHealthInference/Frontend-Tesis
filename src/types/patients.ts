import type { Breed, Species } from "./catalogs";
import type { Owner } from "./owners";

export interface Patient {
  id: number;
  owner_id?: number;
  owner: Owner;
  name: string;
  species_id?: number;
  species: Species;
  breed_id?: number | null;
  breed: Breed | null;
  sex: string;
  birth_date: string | null;
  weight: number | null;
  created_at: string;
}

export interface PatientCreate {
  owner_id: number;
  name: string;
  species_id: number;
  breed_id?: number | null;
  sex: string;
  birth_date?: string | null;
  weight?: number | null;
}

export interface PatientUpdate {
  owner_id?: number | null;
  name?: string | null;
  species_id?: number | null;
  breed_id?: number | null;
  sex?: string | null;
  birth_date?: string | null;
  weight?: number | null;
}

export type PatientResponse = Patient;
export type PatientListItem = Patient;
