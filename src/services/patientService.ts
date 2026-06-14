import type { PatientCreate, PatientResponse, PatientUpdate } from "../types/patients";
import { apiClient } from "./apiClient";

export const patientService = {
  getPatients(): Promise<PatientResponse[]> {
    return apiClient.get<PatientResponse[]>("/api/v1/patients");
  },

  createPatient(payload: PatientCreate): Promise<PatientResponse> {
    return apiClient.post<PatientResponse>("/api/v1/patients", payload);
  },

  getPatientById(patientId: number): Promise<PatientResponse> {
    return apiClient.get<PatientResponse>(`/api/v1/patients/${patientId}`);
  },

  updatePatient(patientId: number, payload: PatientUpdate): Promise<PatientResponse> {
    return apiClient.put<PatientResponse>(`/api/v1/patients/${patientId}`, payload);
  },
};
