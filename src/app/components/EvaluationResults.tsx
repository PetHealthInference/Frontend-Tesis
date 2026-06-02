import { Loader2, ShieldAlert } from "lucide-react";
import { useActivatedRules } from "../../hooks/useEvaluations";
import type { EvaluationResult, ProcessEvaluationResponse, ResultadoEvaluacion } from "../../types/evaluations";

function formatProbability(value: number | null): string {
  if (value == null) {
    return "No calculada";
  }

  return `${Math.round(value * 100)}%`;
}

function formatJsonLike(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

interface ResultadosProps {
  processResponse: ProcessEvaluationResponse | null;
}

export function ResultadosEvaluacion({ processResponse }: ResultadosProps) {
  if (!processResponse) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Resultados del procesamiento</h2>
      {processResponse.resultados.length === 0 && (
        <p className="text-sm text-gray-600">El motor no devolvio resultados para esta evaluacion.</p>
      )}
      {processResponse.resultados.map((result) => (
        <ResultadoCard key={`${result.enfermedad}-${result.nivel_riesgo}`} result={result} />
      ))}
    </div>
  );
}

function ResultadoCard({ result }: { result: ResultadoEvaluacion }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">{result.enfermedad}</p>
          <p className="text-sm text-gray-600">{result.resultado_sugerido}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {result.nivel_riesgo}
        </span>
      </div>
      <p className="text-sm text-gray-700 mt-3">
        Probabilidad bayesiana: {formatProbability(result.probabilidad)}
      </p>
      {result.reglas_activadas.length > 0 && (
        <p className="text-sm text-gray-700 mt-2">
          Reglas activadas: {result.reglas_activadas.join(", ")}
        </p>
      )}
      {result.explicacion && (
        <p className="text-sm text-gray-600 mt-2">{result.explicacion}</p>
      )}
    </div>
  );
}

interface PersistedResultsProps {
  evaluationId: number | null;
  results: EvaluationResult[];
  loading: boolean;
  error: string | null;
}

export function ResultadosPersistidos({ evaluationId, results, loading, error }: PersistedResultsProps) {
  if (!evaluationId) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Resultados persistidos</h2>
      {loading && (
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Consultando /results...
        </p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && results.length === 0 && (
        <p className="text-sm text-gray-600">
          Aun no hay resultados persistidos. Procesa la evaluacion para generarlos.
        </p>
      )}
      {results.map((result) => (
        <div key={result.id} className="border border-gray-200 rounded-lg p-4 mt-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{result.suggested_diagnosis}</p>
              <p className="text-sm text-gray-600">
                Resultado #{result.id} - Riesgo {result.risk_level} - Metodo {result.inference_method ?? "N/D"}
              </p>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              {formatProbability(result.probability)}
            </span>
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

interface ReglasActivadasProps {
  resultId: number;
  fallbackRules: EvaluationResult["activated_rules"];
}

export function ReglasActivadas({ resultId, fallbackRules }: ReglasActivadasProps) {
  const { data, loading, error } = useActivatedRules(resultId);
  const rules = data.length > 0 ? data : fallbackRules;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-gray-700" />
        <p className="text-sm font-medium text-gray-900">Reglas activadas</p>
      </div>
      {loading && (
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Consultando reglas activadas...
        </p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!loading && rules.length === 0 && (
        <p className="text-sm text-gray-600">No hay reglas activadas registradas para este resultado.</p>
      )}
      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">Regla #{rule.rule_id}</p>
            <p className="text-sm text-gray-700 mt-1">{rule.justification}</p>
            <p className="text-xs text-gray-500 mt-2">
              Condiciones cumplidas: {formatJsonLike(rule.fulfilled_conditions)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
