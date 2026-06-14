import type {
  ActivatedRule,
  EvaluationCreate,
  EvaluationResponse,
  EvaluationResult,
  PatientEvaluationHistory,
  ProcessEvaluationResponse,
} from "../types/evaluations";
import { apiClient } from "./apiClient";
import { API_ROUTES } from "./apiRoutes";

export const evaluationService = {
  createEvaluation(payload: EvaluationCreate): Promise<EvaluationResponse> {
    return apiClient.post<EvaluationResponse>(API_ROUTES.evaluations.create, payload);
  },

  getEvaluationById(evaluationId: number): Promise<EvaluationResponse> {
    return apiClient.get<EvaluationResponse>(API_ROUTES.evaluations.byId(evaluationId));
  },

  getEvaluationsByPatient(patientId: number): Promise<EvaluationResponse[]> {
    return apiClient.get<EvaluationResponse[]>(API_ROUTES.evaluations.byPatient(patientId));
  },

  getPatientHistory(patientId: number): Promise<PatientEvaluationHistory[]> {
    return apiClient.get<PatientEvaluationHistory[]>(API_ROUTES.evaluations.history(patientId));
  },

  processEvaluation(evaluationId: number): Promise<ProcessEvaluationResponse> {
    return apiClient.post<ProcessEvaluationResponse>(API_ROUTES.evaluations.process(evaluationId));
  },

  getEvaluationResults(evaluationId: number): Promise<EvaluationResult[]> {
    return apiClient.get<EvaluationResult[]>(API_ROUTES.evaluations.results(evaluationId));
  },

  getActivatedRules(resultId: number): Promise<ActivatedRule[]> {
    return apiClient.get<ActivatedRule[]>(API_ROUTES.evaluations.activatedRules(resultId));
  },
};
