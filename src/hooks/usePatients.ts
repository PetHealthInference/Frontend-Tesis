import { useCallback, useEffect, useState } from "react";
import { patientService } from "../services/patientService";
import type { PatientCreate, PatientResponse, PatientUpdate } from "../types/patients";

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No fue posible completar la operacion.";
}

export function usePatients() {
  const [state, setState] = useState<AsyncState<PatientResponse[]>>({
    data: [],
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const patients = await patientService.getPatients();
      setState({ data: patients, loading: false, error: null });
    } catch (error) {
      setState({ data: [], loading: false, error: getErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function usePatient(patientId: number | null) {
  const [state, setState] = useState<AsyncState<PatientResponse | null>>({
    data: null,
    loading: Boolean(patientId),
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!patientId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const patient = await patientService.getPatientById(patientId);
      setState({ data: patient, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: getErrorMessage(error) });
    }
  }, [patientId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useCreatePatient() {
  const [data, setData] = useState<PatientResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = useCallback(async (payload: PatientCreate) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const patient = await patientService.createPatient(payload);
      setData(patient);
      setSuccess(`Paciente ${patient.name} registrado correctamente.`);
      return patient;
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

export function useUpdatePatient() {
  const [data, setData] = useState<PatientResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = useCallback(async (patientId: number, payload: PatientUpdate) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const patient = await patientService.updatePatient(patientId, payload);
      setData(patient);
      setSuccess(`Paciente ${patient.name} actualizado correctamente.`);
      return patient;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, success, submit };
}
