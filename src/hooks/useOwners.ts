import { useCallback, useEffect, useState } from "react";
import { ownerService } from "../services/ownerService";
import type { Owner, OwnerCreate, OwnerResponse } from "../types/owners";

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No fue posible completar la operacion.";
}

export function useOwners() {
  const [state, setState] = useState<AsyncState<Owner[]>>({
    data: [],
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const owners = await ownerService.getOwners();
      setState({ data: owners, loading: false, error: null });
    } catch (error) {
      setState({ data: [], loading: false, error: getErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useOwner(ownerId: number | null) {
  const [state, setState] = useState<AsyncState<OwnerResponse | null>>({
    data: null,
    loading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!ownerId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const owner = await ownerService.getOwnerById(ownerId);
      setState({ data: owner, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: getErrorMessage(error) });
    }
  }, [ownerId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, refetch, reset };
}

export function useCreateOwner() {
  const [data, setData] = useState<OwnerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = useCallback(async (payload: OwnerCreate) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const owner = await ownerService.createOwner(payload);
      setData(owner);
      setSuccess(`Propietario registrado con ID ${owner.id}.`);
      return owner;
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
