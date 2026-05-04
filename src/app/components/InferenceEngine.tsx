import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Brain, AlertTriangle, CheckCircle, FileText, Activity } from 'lucide-react';

export function InferenceEngine() {
  const navigate = useNavigate();
  const { evaluationId } = useParams();

  const inferenceResult = {
    diagnosis: 'Traqueobronquitis Infecciosa Canina (Tos de las Perreras)',
    confidence: 87,
    riskLevel: 'Moderado',
    reasoning: [
      'Presencia de tos seca y persistente',
      'Temperatura corporal elevada (39.2°C)',
      'Frecuencia cardíaca dentro de rango normal',
      'Sin signos de dificultad respiratoria severa',
      'Historial reciente de contacto con otros perros',
    ],
    recommendations: [
      'Administrar antibióticos de amplio espectro',
      'Reposo absoluto durante 7-10 días',
      'Evitar contacto con otros animales',
      'Monitorear temperatura diariamente',
      'Seguimiento en 3-5 días',
    ],
    relatedConditions: [
      { name: 'Bronquitis Crónica', probability: 15 },
      { name: 'Neumonía Bacterial', probability: 8 },
      { name: 'Infección Viral Respiratoria', probability: 12 },
    ],
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Crítico':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Alto':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Moderado':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Evaluación
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resultados del Motor de Inferencia</h1>
            <p className="text-gray-600">Evaluación ID: {evaluationId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 border-2 rounded-lg ${getRiskColor(inferenceResult.riskLevel)}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">Nivel de Riesgo</p>
            </div>
            <p className="text-xl font-bold">{inferenceResult.riskLevel}</p>
          </div>

          <div className="p-4 border-2 border-indigo-200 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-indigo-700" />
              <p className="text-sm font-medium text-indigo-700">Confianza</p>
            </div>
            <p className="text-xl font-bold text-indigo-900">{inferenceResult.confidence}%</p>
          </div>

          <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-5 h-5 text-green-700" />
              <p className="text-sm font-medium text-green-700">Estado</p>
            </div>
            <p className="text-xl font-bold text-green-900">Diagnosticado</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnóstico Sugerido</h2>
          <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-lg font-medium text-indigo-900">{inferenceResult.diagnosis}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Justificación del Diagnóstico</h2>
          <div className="space-y-2">
            {inferenceResult.reasoning.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recomendaciones de Tratamiento</h2>
          <div className="space-y-2">
            {inferenceResult.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnósticos Diferenciales</h2>
          <div className="space-y-2">
            {inferenceResult.relatedConditions.map((condition, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{condition.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${condition.probability}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12">{condition.probability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/patients/1')}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Guardar y Ver Paciente
          </button>
          <button
            onClick={() => navigate('/evaluation')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Nueva Evaluación
          </button>
        </div>
      </div>
    </div>
  );
}
