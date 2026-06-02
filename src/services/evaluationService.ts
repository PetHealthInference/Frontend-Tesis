import type {
  ActivatedRule,
  EvaluationCreate,
  EvaluationResponse,
  EvaluationResult,
  ProcessEvaluationResponse,
} from "../types/evaluations";
import { apiClient } from "./apiClient";

export const evaluationService = {
  createEvaluation(payload: EvaluationCreate): Promise<EvaluationResponse> {
    return apiClient.post<EvaluationResponse>("/api/v1/evaluations", payload);
  },

  getEvaluationById(evaluationId: number): Promise<EvaluationResponse> {
    return apiClient.get<EvaluationResponse>(`/api/v1/evaluations/${evaluationId}`);
  },

  getEvaluationsByPatient(patientId: number): Promise<EvaluationResponse[]> {
    return apiClient.get<EvaluationResponse[]>(`/api/v1/patients/${patientId}/evaluations`);
  },

  processEvaluation(evaluationId: number): Promise<ProcessEvaluationResponse> {
    return apiClient.post<ProcessEvaluationResponse>(`/api/v1/evaluaciones/${evaluationId}/procesar`);
  },

  getEvaluationResults(evaluationId: number): Promise<EvaluationResult[]> {
    return apiClient.get<EvaluationResult[]>(`/api/v1/evaluations/${evaluationId}/results`);
  },

  getActivatedRules(resultId: number): Promise<ActivatedRule[]> {
    return apiClient.get<ActivatedRule[]>(`/api/v1/results/${resultId}/activated-rules`);
  },
};
