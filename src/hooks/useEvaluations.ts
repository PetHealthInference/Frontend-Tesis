import { useCallback, useEffect, useState } from "react";
import { evaluationService } from "../services/evaluationService";
import type {
  ActivatedRule,
  EvaluationCreate,
  EvaluationResponse,
  EvaluationResult,
  ProcessEvaluationResponse,
} from "../types/evaluations";

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No fue posible completar la operacion.";
}

export function useEvaluations(patientId: number | null) {
  const [state, setState] = useState<AsyncState<EvaluationResponse[]>>({
    data: [],
    loading: Boolean(patientId),
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!patientId) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const evaluations = await evaluationService.getEvaluationsByPatient(patientId);
      setState({ data: evaluations, loading: false, error: null });
    } catch (error) {
      setState({ data: [], loading: false, error: getErrorMessage(error) });
    }
  }, [patientId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useEvaluation(evaluationId: number | null) {
  const [state, setState] = useState<AsyncState<EvaluationResponse | null>>({
    data: null,
    loading: Boolean(evaluationId),
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!evaluationId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const evaluation = await evaluationService.getEvaluationById(evaluationId);
      setState({ data: evaluation, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: getErrorMessage(error) });
    }
  }, [evaluationId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useCreateEvaluation() {
  const [data, setData] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = useCallback(async (payload: EvaluationCreate) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const evaluation = await evaluationService.createEvaluation(payload);
      setData(evaluation);
      setSuccess(`Evaluacion #${evaluation.id} creada correctamente.`);
      return evaluation;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { data, loading, error, success, submit, reset };
}

export function useProcessEvaluation() {
  const [data, setData] = useState<ProcessEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (evaluationId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await evaluationService.processEvaluation(evaluationId);
      setData(response);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, submit };
}

export function useEvaluationResults(evaluationId: number | null) {
  const [state, setState] = useState<AsyncState<EvaluationResult[]>>({
    data: [],
    loading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!evaluationId) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const results = await evaluationService.getEvaluationResults(evaluationId);
      setState({ data: results, loading: false, error: null });
    } catch (error) {
      setState({ data: [], loading: false, error: getErrorMessage(error) });
    }
  }, [evaluationId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useActivatedRules(resultId: number | null) {
  const [state, setState] = useState<AsyncState<ActivatedRule[]>>({
    data: [],
    loading: Boolean(resultId),
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!resultId) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const rules = await evaluationService.getActivatedRules(resultId);
      setState({ data: rules, loading: false, error: null });
    } catch (error) {
      setState({ data: [], loading: false, error: getErrorMessage(error) });
    }
  }, [resultId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}
