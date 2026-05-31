import type { Breed, Species } from "./catalogs";
import type { Owner } from "./owners";

export interface PatientCreate {
  owner_id: number;
  name: string;
  species_id: number;
  breed_id?: number | null;
  sex: string;
  birth_date?: string | null;
  weight?: number | null;
}

export interface PatientResponse {
  id: number;
  owner: Owner;
  name: string;
  species: Species;
  breed: Breed | null;
  sex: string;
  birth_date: string | null;
  weight: number | null;
  created_at: string;
}
