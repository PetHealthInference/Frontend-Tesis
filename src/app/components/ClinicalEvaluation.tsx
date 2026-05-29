import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Brain, AlertCircle } from "lucide-react";
import { useClinicalVariables, useSymptoms } from "../../hooks/useCatalogs";

interface ClinicalFact {
  fact_key: string;
  value: string | number | boolean | string[];
  source_type: string;
}

export function ClinicalEvaluation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
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

  const [formData, setFormData] = useState({
    patientId: patientId || "",
    selectedSymptoms: [] as string[],
    variableValues: {} as Record<string, string>,
    history: "",
    notes: "",
  });

  const catalogError = symptomsError ?? variablesError;

  const facts = useMemo<ClinicalFact[]>(() => {
    const symptomFacts = formData.selectedSymptoms.map((symptomId) => {
      const symptom = symptoms.find((item) => String(item.id) === symptomId);

      return {
        fact_key: symptom ? `symptom_${symptom.id}` : `symptom_${symptomId}`,
        value: true,
        source_type: "clinical_input",
      };
    });

    const variableFacts = Object.entries(formData.variableValues)
      .filter(([, value]) => value !== "")
      .map(([key, value]) => ({
        fact_key: key,
        value: Number.isNaN(Number(value)) ? value : Number(value),
        source_type: "clinical_input",
      }));

    return [...symptomFacts, ...variableFacts];
  }, [formData.selectedSymptoms, formData.variableValues, symptoms]);

  const toggleSymptom = (symptomId: string) => {
    const isSelected = formData.selectedSymptoms.includes(symptomId);
    setFormData({
      ...formData,
      selectedSymptoms: isSelected
        ? formData.selectedSymptoms.filter((id) => id !== symptomId)
        : [...formData.selectedSymptoms, symptomId],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      patient_id: Number(formData.patientId),
      reason: formData.history || null,
      observations: formData.notes || null,
      facts,
    };

    console.info("Evaluacion preparada para API:", payload);
    navigate(`/inference/1?patientId=${formData.patientId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Evaluacion Clinica</h1>
        <p className="text-gray-600 mt-1">Captura los datos clinicos del paciente</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {catalogError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{catalogError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Paciente
          </label>
          <select
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Selecciona un paciente</option>
            <option value="1">Max - Perro (Golden Retriever)</option>
            <option value="2">Luna - Gato (Siames)</option>
            <option value="3">Rocky - Perro (Pastor Aleman)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sintomas Observados
          </label>
          <div className="border border-gray-300 rounded-lg p-4 space-y-3">
            {symptomsLoading && <p className="text-sm text-gray-500">Cargando sintomas...</p>}
            {!symptomsLoading && symptoms.length === 0 && !symptomsError && (
              <p className="text-sm text-gray-500">No hay sintomas activos registrados.</p>
            )}
            {symptoms.map((symptom) => (
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
            {!variablesLoading && clinicalVariables.length === 0 && !variablesError && (
              <p className="text-sm text-gray-500 md:col-span-3">
                No hay variables clinicas activas registradas.
              </p>
            )}
            {clinicalVariables.map((variable) => (
              <div key={variable.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {variable.name}
                  {variable.unit ? ` (${variable.unit})` : ""}
                </label>
                <input
                  type={variable.data_type === "number" ? "number" : "text"}
                  step={variable.data_type === "number" ? "0.1" : undefined}
                  value={formData.variableValues[variable.key] ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      variableValues: {
                        ...formData.variableValues,
                        [variable.key]: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={variable.normal_min != null && variable.normal_max != null
                    ? `${variable.normal_min} - ${variable.normal_max}`
                    : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Antecedentes Relevantes
          </label>
          <textarea
            value={formData.history}
            onChange={(e) => setFormData({ ...formData, history: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Historial medico, alergias, medicamentos actuales..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={Boolean(catalogError) || facts.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Brain className="w-5 h-5" />
            Procesar con Motor de Inferencia
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
            Al enviar esta evaluacion, el motor de inferencia analizara los datos clinicos y
            proporcionara un diagnostico sugerido junto con el nivel de riesgo del paciente.
          </p>
        </div>
      </form>
    </div>
  );
}
