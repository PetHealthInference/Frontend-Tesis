import { useCallback, useEffect, useState } from "react";
import { catalogService } from "../services/catalogService";
import type { Breed, ClinicalVariable, Disease, Species, Symptom } from "../types/catalogs";

interface CatalogState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No fue posible cargar el catalogo.";
}

function useCatalogResource<T>(load: () => Promise<T>, initialData: T): CatalogState<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await load();
      setData(response);
    } catch (err) {
      setData(initialData);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useSpecies(): CatalogState<Species[]> {
  return useCatalogResource<Species[]>(
    useCallback(() => catalogService.getSpecies(), []),
    [],
  );
}

export function useBreeds(speciesId: number | null): CatalogState<Breed[]> {
  const loadBreeds = useCallback(() => {
    if (!speciesId) {
      return Promise.resolve([]);
    }

    return catalogService.getBreedsBySpecies(speciesId);
  }, [speciesId]);

  return useCatalogResource<Breed[]>(loadBreeds, []);
}

export function useSymptoms(): CatalogState<Symptom[]> {
  return useCatalogResource<Symptom[]>(
    useCallback(() => catalogService.getSymptoms(), []),
    [],
  );
}

export function useClinicalVariables(): CatalogState<ClinicalVariable[]> {
  return useCatalogResource<ClinicalVariable[]>(
    useCallback(() => catalogService.getClinicalVariables(), []),
    [],
  );
}

export function useDiseases(): CatalogState<Disease[]> {
  return useCatalogResource<Disease[]>(
    useCallback(() => catalogService.getDiseases(), []),
    [],
  );
}

export function useCatalogs() {
  const species = useSpecies();
  const symptoms = useSymptoms();
  const clinicalVariables = useClinicalVariables();
  const diseases = useDiseases();

  return {
    species,
    symptoms,
    clinicalVariables,
    diseases,
    loading: species.loading || symptoms.loading || clinicalVariables.loading || diseases.loading,
    error: species.error ?? symptoms.error ?? clinicalVariables.error ?? diseases.error,
  };
}
