import type {
  Breed,
  ClinicalVariable,
  Disease,
  RiskLevel,
  Species,
  Symptom,
} from "../types/catalogs";
import { apiClient } from "./apiClient";
import { API_ROUTES } from "./apiRoutes";

export const catalogService = {
  getSpecies(): Promise<Species[]> {
    return apiClient.get<Species[]>(API_ROUTES.catalogs.species);
  },

  getBreedsBySpecies(speciesId: number): Promise<Breed[]> {
    return apiClient.get<Breed[]>(API_ROUTES.catalogs.breeds(speciesId));
  },

  getSymptoms(): Promise<Symptom[]> {
    return apiClient.get<Symptom[]>(API_ROUTES.catalogs.symptoms);
  },

  getClinicalVariables(): Promise<ClinicalVariable[]> {
    return apiClient.get<ClinicalVariable[]>(API_ROUTES.catalogs.clinicalVariables);
  },

  getDiseases(): Promise<Disease[]> {
    return apiClient.get<Disease[]>(API_ROUTES.catalogs.diseases);
  },

  getRiskLevels(): Promise<RiskLevel[]> {
    return apiClient.get<RiskLevel[]>(API_ROUTES.catalogs.riskLevels);
  },
};
