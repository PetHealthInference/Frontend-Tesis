import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Brain, AlertCircle, Loader2, FileText } from "lucide-react";
import { useEvaluationResults } from "../../hooks/useEvaluations";
import { ReglasActivadas } from "./EvaluationResults";

function formatProbability(value: number | null): string {
  if (value == null) {
    return "No calculada";
  }
  return `${Math.round(value * 100)}%`;
}

function riskClassName(riskLevel: string): string {
  const normalized = riskLevel.toLowerCase();
  if (normalized === "alto") {
    return "bg-orange-100 text-orange-700 border-orange-200";
  }
  if (normalized === "moderado") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
  return "bg-green-100 text-green-700 border-green-200";
}

export function InferenceEngine() {
  const navigate = useNavigate();
  const { evaluationId } = useParams();
  const parsedEvaluationId = evaluationId && Number.isFinite(Number(evaluationId)) ? Number(evaluationId) : null;
  const { data: results, loading, error, refetch } = useEvaluationResults(parsedEvaluationId);
  const patientId = results[0]?.patient_id;

  if (!parsedEvaluationId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600">Identificador de evaluacion invalido.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resultados del Motor de Inferencia</h1>
              <p className="text-gray-600">Evaluacion ID: {parsedEvaluationId}</p>
            </div>
          </div>

          <button
            onClick={() => void refetch()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Refrescar
          </button>
        </div>

        {loading && (
          <p className="text-gray-600 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando resultados reales desde backend...
          </p>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="text-gray-600">
            Esta evaluacion aun no tiene resultados persistidos. Procesala desde la pantalla de evaluacion clinica.
          </p>
        )}

        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{result.suggested_diagnosis}</p>
                  <p className="text-sm text-gray-600">
                    Metodo: {result.inference_method ?? "N/D"} - Score: {result.score}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full border text-sm font-medium ${riskClassName(result.risk_level)}`}>
                    Riesgo {result.risk_level}
                  </span>
                  <span className="px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium">
                    {formatProbability(result.probability)}
                  </span>
                </div>
              </div>

              {result.explanation && (
                <p className="text-sm text-gray-700 mt-3">{result.explanation}</p>
              )}

              <ReglasActivadas resultId={result.id} fallbackRules={result.activated_rules} />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => patientId && navigate(`/patients/${patientId}`)}
            disabled={!patientId}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FileText className="w-5 h-5" />
            Ver paciente
          </button>
          <button
            onClick={() => navigate("/evaluation")}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Nueva evaluacion
          </button>
        </div>
      </div>
    </div>
  );
}
