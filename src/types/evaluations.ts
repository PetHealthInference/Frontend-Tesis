import type { PatientResponse } from "./patients";

export type EvaluationFactValue = string | number | boolean | string[] | null;

export interface EvaluationFact {
  fact_key: string;
  value: EvaluationFactValue;
  source_type: "symptom" | "clinical_variable" | "clinical_input" | string;
}

export interface EvaluationFactResponse extends EvaluationFact {
  id: number;
}

export interface EvaluationCreate {
  patient_id: number;
  reason?: string | null;
  observations?: string | null;
  facts: EvaluationFact[];
}

export interface EvaluationResponse {
  id: number;
  patient_id: number;
  veterinarian_id: number;
  reason: string | null;
  observations: string | null;
  created_at: string;
  facts: EvaluationFactResponse[];
  patient?: PatientResponse;
}

export interface ActivatedRule {
  id: number;
  rule_id: number;
  fulfilled_conditions: unknown;
  justification: string;
}

export interface EvaluationResult {
  id: number;
  evaluation_id: number;
  disease_id: number;
  risk_level_id: number;
  suggested_diagnosis: string;
  risk_level: string;
  score: number;
  probability: number | null;
  inference_method: string | null;
  explanation: string | null;
  activated_rules: ActivatedRule[];
}

export interface PatientEvaluationHistory {
  id: number;
  patient_id: number;
  evaluation_id: number | null;
  event_type: string;
  summary: string;
  created_at?: string | null;
}

export interface ProcessedEvaluationResult {
  enfermedad: string;
  probabilidad: number | null;
  nivel_riesgo: string;
  resultado_sugerido: string;
  reglas_activadas: string[];
  explicacion: string | null;
}

export type ResultadoEvaluacion = ProcessedEvaluationResult;

export interface ProcessEvaluationResponse {
  evaluacion_id: number;
  metodo_inferencia: string | null;
  resultados: ProcessedEvaluationResult[];
}
