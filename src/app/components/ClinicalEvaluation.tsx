import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FileText, Brain, AlertCircle } from 'lucide-react';

export function ClinicalEvaluation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');

  const [formData, setFormData] = useState({
    patientId: patientId || '',
    symptoms: '',
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    history: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/inference/1?patientId=${formData.patientId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Evaluación Clínica</h1>
        <p className="text-gray-600 mt-1">Captura los datos clínicos del paciente</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
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
            <option value="2">Luna - Gato (Siamés)</option>
            <option value="3">Rocky - Perro (Pastor Alemán)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Síntomas Observados
          </label>
          <textarea
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Describe los síntomas que presenta el paciente..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperatura (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="38.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia Cardíaca (lpm)
            </label>
            <input
              type="number"
              value={formData.heartRate}
              onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="90"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia Respiratoria (rpm)
            </label>
            <input
              type="number"
              value={formData.respiratoryRate}
              onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="20"
              required
            />
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
            placeholder="Historial médico, alergias, medicamentos actuales..."
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

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
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
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Al enviar esta evaluación, el motor de inferencia analizará los datos clínicos y proporcionará
            un diagnóstico sugerido junto con el nivel de riesgo del paciente.
          </p>
        </div>
      </form>
    </div>
  );
}
