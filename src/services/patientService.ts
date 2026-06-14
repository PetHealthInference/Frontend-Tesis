import type { PatientCreate, PatientResponse, PatientUpdate } from "../types/patients";
import { apiClient } from "./apiClient";
import { API_ROUTES } from "./apiRoutes";

export const patientService = {
  getPatients(): Promise<PatientResponse[]> {
    return apiClient.get<PatientResponse[]>(API_ROUTES.patients.collection);
  },

  createPatient(payload: PatientCreate): Promise<PatientResponse> {
    return apiClient.post<PatientResponse>(API_ROUTES.patients.collection, payload);
  },

  getPatientById(patientId: number): Promise<PatientResponse> {
    return apiClient.get<PatientResponse>(API_ROUTES.patients.byId(patientId));
  },

  updatePatient(patientId: number, payload: PatientUpdate): Promise<PatientResponse> {
    return apiClient.put<PatientResponse>(API_ROUTES.patients.byId(patientId), payload);
  },
};
