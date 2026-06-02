import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
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
  patientName?: string;
  ownerName?: string;
  speciesLabel?: string;
  onNewEvaluation?: () => void;
}

export function PatientEvaluationHistory({
  patientId,
  patientName,
  ownerName,
  speciesLabel,
  onNewEvaluation,
}: PatientEvaluationHistoryProps) {
  const { data, loading, error, refetch } = useEvaluationHistory(patientId);
  const [expandedEvaluationIds, setExpandedEvaluationIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("all");
  const [resultRisk, setResultRisk] = useState("all");
  const [resultSearch, setResultSearch] = useState("");

  const toggleExpanded = (evaluationId: number) => {
    setExpandedEvaluationIds((current) =>
      current.includes(evaluationId)
        ? current.filter((id) => id !== evaluationId)
        : [...current, evaluationId],
    );
  };

  const evaluationIds = data
    .map((item) => item.evaluation_id)
    .filter((evaluationId): evaluationId is number => evaluationId != null);
  const eventTypes = Array.from(new Set(data.map((item) => item.event_type))).sort();

  const filteredData = data.filter((item) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      item.summary.toLowerCase().includes(normalizedSearch) ||
      item.event_type.toLowerCase().includes(normalizedSearch) ||
      String(item.evaluation_id ?? item.id).includes(normalizedSearch);
    const matchesEventType = eventType === "all" || item.event_type === eventType;
    return matchesSearch && matchesEventType;
  });

  const expandAll = () => {
    setExpandedEvaluationIds(evaluationIds);
  };

  const collapseAll = () => {
    setExpandedEvaluationIds([]);
  };

  const clearFilters = () => {
    setSearch("");
    setEventType("all");
    setResultRisk("all");
    setResultSearch("");
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Historial clinico completo</h3>
          <p className="text-sm text-gray-600">
            Trazabilidad de evaluaciones, resultados de inferencia y reglas activadas.
          </p>
          {(patientName || ownerName || speciesLabel) && (
            <p className="text-sm text-gray-500 mt-1">
              {patientName ?? "Paciente"}{speciesLabel ? ` - ${speciesLabel}` : ""}
              {ownerName ? ` - Propietario: ${ownerName}` : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {onNewEvaluation && (
            <button
              type="button"
              onClick={onNewEvaluation}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              <FileText className="w-4 h-4" />
              Nueva evaluacion
            </button>
          )}
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refrescar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por resumen o evaluacion..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">Todos los eventos</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          <X className="w-4 h-4" />
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          value={resultSearch}
          onChange={(event) => setResultSearch(event.target.value)}
          placeholder="Filtrar resultados por enfermedad..."
          className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
        <select
          value={resultRisk}
          onChange={(event) => setResultRisk(event.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        >
          <option value="all">Todos los riesgos</option>
          <option value="Bajo">Bajo</option>
          <option value="Moderado">Moderado</option>
          <option value="Alto">Alto</option>
          <option value="bajo">bajo</option>
          <option value="moderado">moderado</option>
          <option value="alto">alto</option>
        </select>
      </div>

      {evaluationIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Expandir evaluaciones
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Colapsar evaluaciones
          </button>
        </div>
      )}

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

      {!loading && !error && data.length > 0 && filteredData.length === 0 && (
        <p className="text-sm text-gray-600">
          No hay eventos que coincidan con los filtros actuales.
        </p>
      )}

      <div className="space-y-3">
        {filteredData.map((item) => (
          <HistoryEntry
            key={item.id}
            item={item}
            expanded={item.evaluation_id != null && expandedEvaluationIds.includes(item.evaluation_id)}
            onToggle={toggleExpanded}
            resultRisk={resultRisk}
            resultSearch={resultSearch}
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
  resultRisk: string;
  resultSearch: string;
}

function HistoryEntry({ item, expanded, onToggle, resultRisk, resultSearch }: HistoryEntryProps) {
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
        <ExpandedEvaluation
          evaluationId={item.evaluation_id}
          resultRisk={resultRisk}
          resultSearch={resultSearch}
        />
      )}
    </div>
  );
}

function ExpandedEvaluation({
  evaluationId,
  resultRisk,
  resultSearch,
}: {
  evaluationId: number;
  resultRisk: string;
  resultSearch: string;
}) {
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
        resultRisk={resultRisk}
        resultSearch={resultSearch}
      />
    </div>
  );
}

interface EvaluationResultsBlockProps {
  results: EvaluationResult[];
  loading: boolean;
  error: string | null;
  resultRisk: string;
  resultSearch: string;
}

function EvaluationResultsBlock({
  results,
  loading,
  error,
  resultRisk,
  resultSearch,
}: EvaluationResultsBlockProps) {
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

  const filteredResults = results.filter((result) => {
    const normalizedSearch = resultSearch.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      result.suggested_diagnosis.toLowerCase().includes(normalizedSearch) ||
      (result.explanation?.toLowerCase().includes(normalizedSearch) ?? false);
    const matchesRisk =
      resultRisk === "all" ||
      result.risk_level.toLowerCase() === resultRisk.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  if (results.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Esta evaluacion no tiene resultados persistidos. Procesala desde la pantalla de evaluacion.
      </p>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        La evaluacion tiene resultados, pero ninguno coincide con los filtros de enfermedad o riesgo.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {filteredResults.map((result) => (
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
