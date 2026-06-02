import { useState } from "react";
import { AlertCircle, Calendar, ChevronDown, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import {
  useEvaluation,
  useEvaluationHistory,
  useEvaluationResults,
} from "../../hooks/useEvaluations";
import type { EvaluationResult, PatientEvaluationHistory as PatientEvaluationHistoryItem } from "../../types/evaluations";
import { ReglasActivadas } from "./EvaluationResults";

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatProbability(value: number | null): string {
  if (value == null) {
    return "No calculada";
  }

  return `${Math.round(value * 100)}%`;
}

interface PatientEvaluationHistoryProps {
  patientId: number;
}

export function PatientEvaluationHistory({ patientId }: PatientEvaluationHistoryProps) {
  const { data, loading, error, refetch } = useEvaluationHistory(patientId);
  const [expandedEvaluationId, setExpandedEvaluationId] = useState<number | null>(null);

  const toggleExpanded = (evaluationId: number) => {
    setExpandedEvaluationId((current) => (current === evaluationId ? null : evaluationId));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Resultados historicos y reglas activadas</h3>
          <p className="text-sm text-gray-600">
            Trazabilidad de evaluaciones procesadas para este paciente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refrescar
        </button>
      </div>

      {loading && (
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando historial clinico...
        </p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-sm text-gray-600">
          Este paciente aun no tiene evaluaciones procesadas ni eventos de historial registrados.
        </p>
      )}

      <div className="space-y-3">
        {data.map((item) => (
          <HistoryEntry
            key={item.id}
            item={item}
            expanded={item.evaluation_id != null && expandedEvaluationId === item.evaluation_id}
            onToggle={toggleExpanded}
          />
        ))}
      </div>
    </div>
  );
}

interface HistoryEntryProps {
  item: PatientEvaluationHistoryItem;
  expanded: boolean;
  onToggle: (evaluationId: number) => void;
}

function HistoryEntry({ item, expanded, onToggle }: HistoryEntryProps) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(item.created_at)}</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
              {item.event_type}
            </span>
          </div>
          <p className="font-medium text-gray-900">
            {item.evaluation_id ? `Evaluacion #${item.evaluation_id}` : `Evento #${item.id}`}
          </p>
          <p className="text-sm text-gray-700 mt-1">{item.summary}</p>
        </div>

        {item.evaluation_id && (
          <button
            type="button"
            onClick={() => onToggle(item.evaluation_id as number)}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm whitespace-nowrap"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Ver detalle evaluacion
          </button>
        )}
      </div>

      {expanded && item.evaluation_id && (
        <ExpandedEvaluation evaluationId={item.evaluation_id} />
      )}
    </div>
  );
}

function ExpandedEvaluation({ evaluationId }: { evaluationId: number }) {
  const evaluation = useEvaluation(evaluationId);
  const results = useEvaluationResults(evaluationId);

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      {evaluation.loading && (
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando detalle de evaluacion...
        </p>
      )}
      {evaluation.error && <p className="text-sm text-red-700">{evaluation.error}</p>}
      {evaluation.data && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Fecha: {formatDate(evaluation.data.created_at)}</p>
          <p className="text-sm text-gray-700 mt-1">
            Motivo: {evaluation.data.reason ?? "No registrado"}
          </p>
          {evaluation.data.observations && (
            <p className="text-sm text-gray-700 mt-1">Observaciones: {evaluation.data.observations}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">Facts registrados: {evaluation.data.facts.length}</p>
        </div>
      )}

      <EvaluationResultsBlock
        results={results.data}
        loading={results.loading}
        error={results.error}
      />
    </div>
  );
}

interface EvaluationResultsBlockProps {
  results: EvaluationResult[];
  loading: boolean;
  error: string | null;
}

function EvaluationResultsBlock({ results, loading, error }: EvaluationResultsBlockProps) {
  if (loading) {
    return (
      <p className="text-sm text-gray-600 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando resultados de inferencia...
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Esta evaluacion no tiene resultados persistidos. Procesala desde la pantalla de evaluacion.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-gray-900">{result.suggested_diagnosis}</p>
              <p className="text-sm text-gray-600">
                Resultado #{result.id} - Metodo {result.inference_method ?? "N/D"}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                Riesgo {result.risk_level}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                {formatProbability(result.probability)}
              </span>
            </div>
          </div>
          {result.explanation && (
            <p className="text-sm text-gray-700 mt-2">{result.explanation}</p>
          )}
          <ReglasActivadas resultId={result.id} fallbackRules={result.activated_rules} />
        </div>
      ))}
    </div>
  );
}
