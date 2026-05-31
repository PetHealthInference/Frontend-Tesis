import type { PatientCreate, PatientResponse } from "../types/patients";
import { apiClient } from "./apiClient";

export const patientService = {
  createPatient(payload: PatientCreate): Promise<PatientResponse> {
    return apiClient.post<PatientResponse>("/api/v1/patients", payload);
  },
};
