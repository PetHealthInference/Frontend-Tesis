import { useCallback, useEffect, useMemo, useState } from "react";
import { evaluationService } from "../services/evaluationService";
import { ownerService } from "../services/ownerService";
import { patientService } from "../services/patientService";
import type { EvaluationResponse, EvaluationResult } from "../types/evaluations";
import type { PatientResponse } from "../types/patients";

interface DashboardState {
  patients: PatientResponse[];
  ownersTotal: number | null;
  evaluationsTodayTotal: number | null;
  criticalCasesTotal: number | null;
  loading: boolean;
  error: string | null;
  warnings: string[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No fue posible completar la operacion.";
}

function getPatientCreatedTime(patient: PatientResponse): number {
  const createdAt = Date.parse(patient.created_at);
  return Number.isNaN(createdAt) ? 0 : createdAt;
}

export function sortPatientsByCreatedAtDesc(patients: PatientResponse[]) {
  return [...patients].sort((first, second) => getPatientCreatedTime(second) - getPatientCreatedTime(first));
}

function isToday(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function normalizeRisk(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function countEvaluationsToday(evaluations: EvaluationResponse[]) {
  return evaluations.filter((evaluation) => isToday(evaluation.created_at)).length;
}

function countCriticalPatients(results: EvaluationResult[]) {
  const criticalPatientIds = new Set<number>();

  results.forEach((result) => {
    const risk = normalizeRisk(result.risk_level);

    if (risk === "alto" || risk === "alta" || risk === "critico" || risk === "critica") {
      criticalPatientIds.add(result.patient_id);
    }
  });

  return criticalPatientIds.size;
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    patients: [],
    ownersTotal: null,
    evaluationsTodayTotal: null,
    criticalCasesTotal: null,
    loading: true,
    error: null,
    warnings: [],
  });

  const refetch = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null, warnings: [] }));

    const warnings: string[] = [];

    try {
      const patients = await patientService.getPatients();
      const ownersResult = await Promise.allSettled([ownerService.getOwners()]);
      const evaluationsResult = await Promise.allSettled(
        patients.map((patient) => evaluationService.getEvaluationsByPatient(patient.id)),
      );

      const ownersTotal =
        ownersResult[0].status === "fulfilled" ? ownersResult[0].value.length : null;

      if (ownersResult[0].status === "rejected") {
        warnings.push(`No fue posible cargar propietarios: ${getErrorMessage(ownersResult[0].reason)}`);
      }

      const fulfilledEvaluations = evaluationsResult
        .filter((result): result is PromiseFulfilledResult<EvaluationResponse[]> => result.status === "fulfilled")
        .map((result) => result.value);

      const evaluations = fulfilledEvaluations.flat();
      const evaluationsTodayTotal =
        evaluationsResult.length === 0 || fulfilledEvaluations.length > 0 ? countEvaluationsToday(evaluations) : null;

      if (evaluationsResult.some((result) => result.status === "rejected")) {
        warnings.push("Algunas evaluaciones por paciente no pudieron cargarse para calcular evaluaciones de hoy.");
      }

      const resultsResult = await Promise.allSettled(
        evaluations.map((evaluation) => evaluationService.getEvaluationResults(evaluation.id)),
      );

      const fulfilledResults = resultsResult
        .filter((result): result is PromiseFulfilledResult<EvaluationResult[]> => result.status === "fulfilled")
        .map((result) => result.value);

      const criticalCasesTotal =
        resultsResult.length === 0 || fulfilledResults.length > 0 ? countCriticalPatients(fulfilledResults.flat()) : null;

      if (resultsResult.some((result) => result.status === "rejected")) {
        warnings.push("Algunos resultados de inferencia no pudieron cargarse para calcular casos criticos.");
      }

      setState({
        patients,
        ownersTotal,
        evaluationsTodayTotal,
        criticalCasesTotal,
        loading: false,
        error: null,
        warnings,
      });
    } catch (error) {
      setState({
        patients: [],
        ownersTotal: null,
        evaluationsTodayTotal: null,
        criticalCasesTotal: null,
        loading: false,
        error: getErrorMessage(error),
        warnings,
      });
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const recentPatients = useMemo(() => sortPatientsByCreatedAtDesc(state.patients).slice(0, 6), [state.patients]);

  return {
    ...state,
    recentPatients,
    totalPatients: state.patients.length,
    refetch,
  };
}
