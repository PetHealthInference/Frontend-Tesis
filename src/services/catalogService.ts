import type {
  Breed,
  ClinicalVariable,
  Disease,
  Species,
  Symptom,
} from "../types/catalogs";
import { apiClient } from "./apiClient";

export const catalogService = {
  getSpecies(): Promise<Species[]> {
    return apiClient.get<Species[]>("/api/v1/species");
  },

  getBreedsBySpecies(speciesId: number): Promise<Breed[]> {
    return apiClient.get<Breed[]>(`/api/v1/breeds?species_id=${speciesId}`);
  },

  getSymptoms(): Promise<Symptom[]> {
    return apiClient.get<Symptom[]>("/api/v1/symptoms");
  },

  getClinicalVariables(): Promise<ClinicalVariable[]> {
    return apiClient.get<ClinicalVariable[]>("/api/v1/clinical-variables");
  },

  getDiseases(): Promise<Disease[]> {
    return apiClient.get<Disease[]>("/api/v1/diseases");
  },

};
