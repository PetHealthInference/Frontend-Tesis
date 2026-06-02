import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Brain, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useClinicalVariables, useSymptoms } from "../../hooks/useCatalogs";
import { usePatients } from "../../hooks/usePatients";
import {
  useCreateEvaluation,
  useEvaluationResults,
  useProcessEvaluation,
} from "../../hooks/useEvaluations";
import type { EvaluationCreate, EvaluationFact } from "../../types/evaluations";
import { ResultadosEvaluacion, ResultadosPersistidos } from "./EvaluationResults";

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseVariableValue(value: string, dataType: string): string | number {
  if (dataType === "numeric" || dataType === "number") {
    return Number(value);
  }

  return value.trim().toLowerCase();
}

export function ClinicalEvaluation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedPatientId = searchParams.get("patient_id") ?? searchParams.get("patientId") ?? "";

  const {
    data: patients,
    loading: patientsLoading,
    error: patientsError,
  } = usePatients();
  const {
    data: symptoms,
    loading: symptomsLoading,
    error: symptomsError,
  } = useSymptoms();
  const {
    data: clinicalVariables,
    loading: variablesLoading,
    error: variablesError,
  } = useClinicalVariables();
  const createEvaluation = useCreateEvaluation();
  const processEvaluation = useProcessEvaluation();

  const [createdEvaluationId, setCreatedEvaluationId] = useState<number | null>(null);
  const evaluationResults = useEvaluationResults(createdEvaluationId);
  const [formError, setFormError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patientId: requestedPatientId,
    selectedSymptoms: [] as string[],
    variableValues: {} as Record<string, string>,
    reason: "",
    observations: "",
  });

  const selectedPatient = patients.find((patient) => String(patient.id) === formData.patientId);
  const selectedSpeciesId = selectedPatient?.species.id ?? null;
  const catalogError = patientsError ?? symptomsError ?? variablesError;

  const filteredSymptoms = useMemo(() => {
    return symptoms.filter((symptom) => {
      return symptom.is_active && (!selectedSpeciesId || !symptom.species_id || symptom.species_id === selectedSpeciesId);
    });
  }, [selectedSpeciesId, symptoms]);

  const filteredVariables = useMemo(() => {
    return clinicalVariables.filter((variable) => {
      return variable.is_active && (!selectedSpeciesId || !variable.species_id || variable.species_id === selectedSpeciesId);
    });
  }, [clinicalVariables, selectedSpeciesId]);

  const facts = useMemo<EvaluationFact[]>(() => {
    const symptomFacts = formData.selectedSymptoms
      .map((symptomId) => symptoms.find((item) => String(item.id) === symptomId))
      .filter((symptom): symptom is NonNullable<typeof symptom> => Boolean(symptom))
      .map((symptom) => ({
        fact_key: symptom.name,
        value: true,
        source_type: "symptom",
      }));

    const variableFacts = Object.entries(formData.variableValues)
      .filter(([, value]) => value.trim() !== "")
      .map(([key, value]) => {
        const variable = clinicalVariables.find((item) => item.key === key);

        return {
          fact_key: key,
          value: parseVariableValue(value, variable?.data_type ?? "string"),
          source_type: "clinical_variable",
        };
      });

    return [...symptomFacts, ...variableFacts];
  }, [clinicalVariables, formData.selectedSymptoms, formData.variableValues, symptoms]);

  const toggleSymptom = (symptomId: string) => {
    const isSelected = formData.selectedSymptoms.includes(symptomId);
    setFormData({
      ...formData,
      selectedSymptoms: isSelected
        ? formData.selectedSymptoms.filter((id) => id !== symptomId)
        : [...formData.selectedSymptoms, symptomId],
    });
    setCreatedEvaluationId(null);
    setProcessSuccess(null);
  };

  const handlePatientChange = (patientId: string) => {
    setFormData({
      ...formData,
      patientId,
      selectedSymptoms: [],
      variableValues: {},
    });
    setCreatedEvaluationId(null);
    setProcessSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setProcessSuccess(null);

    if (!formData.patientId) {
      setFormError("Selecciona un paciente real antes de crear la evaluacion.");
      return;
    }

    if (facts.length === 0) {
      setFormError("Registra al menos un sintoma o una variable clinica como fact.");
      return;
    }

    const invalidNumericVariable = Object.entries(formData.variableValues).some(([key, value]) => {
      const variable = clinicalVariables.find((item) => item.key === key);
      return value.trim() !== "" && (variable?.data_type === "numeric" || variable?.data_type === "number") && Number.isNaN(Number(value));
    });

    if (invalidNumericVariable) {
      setFormError("Las variables numericas deben tener valores numericos validos.");
      return;
    }

    const payload: EvaluationCreate = {
      patient_id: Number(formData.patientId),
      reason: normalizeOptional(formData.reason),
      observations: normalizeOptional(formData.observations),
      facts,
    };

    try {
      const evaluation = await createEvaluation.submit(payload);
      setCreatedEvaluationId(evaluation.id);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No fue posible crear la evaluacion.");
    }
  };

  const handleProcessEvaluation = async () => {
    if (!createdEvaluationId) {
      return;
    }

    setFormError(null);
    setProcessSuccess(null);

    try {
      const response = await processEvaluation.submit(createdEvaluationId);
      setProcessSuccess(`Evaluacion #${response.evaluacion_id} procesada con ${response.resultados.length} resultado(s).`);
      await evaluationResults.refetch();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No fue posible procesar la evaluacion.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Evaluacion Clinica</h1>
        <p className="text-gray-600 mt-1">Captura facts clinicos normalizados para el motor de inferencia</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {(catalogError || createEvaluation.error || processEvaluation.error || formError) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">
              {catalogError ?? createEvaluation.error ?? processEvaluation.error ?? formError}
            </p>
          </div>
        )}

        {(createEvaluation.success || processSuccess) && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">{processSuccess ?? createEvaluation.success}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Paciente
          </label>
          <select
            value={formData.patientId}
            onChange={(e) => handlePatientChange(e.target.value)}
            disabled={patientsLoading || Boolean(patientsError)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
            required
          >
            <option value="">
              {patientsLoading ? "Cargando pacientes..." : "Selecciona un paciente"}
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                #{patient.id} - {patient.name} - {patient.species.name}
                {patient.breed ? ` (${patient.breed.name})` : ""}
              </option>
            ))}
          </select>
          {selectedPatient && (
            <p className="text-sm text-gray-500 mt-2">
              Propietario: {selectedPatient.owner.first_name} {selectedPatient.owner.last_name ?? ""}.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de consulta
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ej: poliuria, polidipsia y perdida de peso observadas por el propietario."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sintomas Observados
          </label>
          <div className="border border-gray-300 rounded-lg p-4 space-y-3">
            {symptomsLoading && <p className="text-sm text-gray-500">Cargando sintomas...</p>}
            {!symptomsLoading && !formData.patientId && (
              <p className="text-sm text-gray-500">Selecciona un paciente para filtrar sintomas por especie.</p>
            )}
            {!symptomsLoading && formData.patientId && filteredSymptoms.length === 0 && !symptomsError && (
              <p className="text-sm text-gray-500">No hay sintomas activos para la especie seleccionada.</p>
            )}
            {filteredSymptoms.map((symptom) => (
              <label key={symptom.id} className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.selectedSymptoms.includes(String(symptom.id))}
                  onChange={() => toggleSymptom(String(symptom.id))}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{symptom.name}</span>
                  {symptom.description && (
                    <span className="block text-gray-500">{symptom.description}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Variables Clinicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variablesLoading && (
              <p className="text-sm text-gray-500 md:col-span-3">Cargando variables clinicas...</p>
            )}
            {!variablesLoading && !formData.patientId && (
              <p className="text-sm text-gray-500 md:col-span-3">
                Selecciona un paciente para filtrar variables por especie.
              </p>
            )}
            {!variablesLoading && formData.patientId && filteredVariables.length === 0 && !variablesError && (
              <p className="text-sm text-gray-500 md:col-span-3">
                No hay variables clinicas activas para la especie seleccionada.
              </p>
            )}
            {filteredVariables.map((variable) => (
              <div key={`${variable.id}-${variable.key}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {variable.name}
                  {variable.unit ? ` (${variable.unit})` : ""}
                </label>
                <input
                  type={variable.data_type === "numeric" || variable.data_type === "number" ? "number" : "text"}
                  step={variable.data_type === "numeric" || variable.data_type === "number" ? "0.1" : undefined}
                  value={formData.variableValues[variable.key] ?? ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      variableValues: {
                        ...formData.variableValues,
                        [variable.key]: e.target.value,
                      },
                    });
                    setCreatedEvaluationId(null);
                    setProcessSuccess(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={
                    variable.normal_min != null && variable.normal_max != null
                      ? `${variable.normal_min} - ${variable.normal_max}`
                      : "Ej: presente, positivo"
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Observaciones adicionales del veterinario..."
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Facts preparados</p>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(facts, null, 2)}
          </pre>
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={createEvaluation.loading || Boolean(catalogError) || !formData.patientId || facts.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createEvaluation.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            {createEvaluation.loading ? "Creando evaluacion..." : "Crear evaluacion"}
          </button>
          <button
            type="button"
            onClick={handleProcessEvaluation}
            disabled={!createdEvaluationId || processEvaluation.loading}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {processEvaluation.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            {processEvaluation.loading ? "Procesando..." : "Procesar evaluacion"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>

        <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Primero se registra la evaluacion con facts persistidos. Luego el boton de procesamiento
            ejecuta el motor hibrido de reglas + Bayes sobre la evaluacion creada.
          </p>
        </div>
      </form>

      <ResultadosEvaluacion processResponse={processEvaluation.data} />

      <ResultadosPersistidos
        evaluationId={createdEvaluationId}
        results={evaluationResults.data}
        loading={evaluationResults.loading}
        error={evaluationResults.error}
      />
    </div>
  );
}
