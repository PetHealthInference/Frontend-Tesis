export interface Species {
  id: number;
  name: string;
}

export interface Breed {
  id: number;
  species_id: number;
  name: string;
  species?: Species | null;
}

export interface Symptom {
  id: number;
  name: string;
  description: string | null;
  species_id: number | null;
  is_active: boolean;
}

export interface ClinicalVariable {
  id: number;
  key: string;
  name: string;
  data_type: string;
  unit: string | null;
  normal_min: number | null;
  normal_max: number | null;
  species_id: number | null;
  is_active: boolean;
}

export interface Disease {
  id: number;
  name: string;
  species_id: number;
  description: string | null;
  is_degenerative: boolean;
  is_active: boolean;
}

export interface RiskLevel {
  id: number;
  code: string;
  name: string;
  description: string | null;
  min_probability: number | null;
  max_probability: number | null;
  sort_order: number;
  is_active: boolean;
}
